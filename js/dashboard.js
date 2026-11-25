import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

// Pega o usuário e a senha guardados pelo login.js.
// Isso só protege a navegação desta demonstração: quem de fato confere a senha
// é o banco, a cada chamada de salvar_projeto e excluir_projeto.
const usuarioLogado = sessionStorage.getItem("usuarioLogin");
const senhaLogada = sessionStorage.getItem("senhaLogin");
const temSessao = Boolean(usuarioLogado && senhaLogada);

if (!temSessao) {
  window.location.replace("login.html");
}

// Cria o cliente do Supabase (a biblioteca vem do CDN no dashboard.html).
const cliente = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Aceita somente endereços que começam com http:// ou https://.
// Isso impede links perigosos, como "javascript:...".
function ehUrlSegura(texto) {
  try {
    const url = new URL(texto);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// Estas três funções isolam o acesso aos dados. Agora são assíncronas porque
// precisam esperar a resposta do banco pela internet.
async function lerProjetos() {
  const { data, error } = await cliente
    .from("projetos")
    .select("id, titulo, descricao, imagem, link, publicado, criado_em")
    .order("criado_em", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

async function salvarProjeto(projeto) {
  // Campos opcionais vazios vão como null (ausência de valor) para o banco.
  const { data, error } = await cliente.rpc("salvar_projeto", {
    p_usuario: usuarioLogado,
    p_senha: senhaLogada,
    p_titulo: projeto.titulo,
    p_descricao: projeto.descricao,
    p_imagem: projeto.imagem || null,
    p_link: projeto.link || null,
  });

  if (error) throw error;
  return data; // id (uuid) do projeto criado
}

async function excluirProjeto(id) {
  const { data, error } = await cliente.rpc("excluir_projeto", {
    p_usuario: usuarioLogado,
    p_senha: senhaLogada,
    p_id: id,
  });

  if (error) throw error;
  return data; // true se excluiu
}

const formularioProjeto = document.querySelector("#formulario-projeto");
const mensagemProjeto = document.querySelector("#mensagem-projeto");
const listaDashboard = document.querySelector("#lista-dashboard");
const botaoSair = document.querySelector("#botao-sair");

// Mostra uma mensagem verde (sucesso) ou vermelha (erro) abaixo do formulário.
function mostrarMensagem(texto, tipo) {
  mensagemProjeto.textContent = texto;
  mensagemProjeto.classList.toggle("sucesso", tipo === "sucesso");
  mensagemProjeto.classList.toggle("erro", tipo === "erro");
}

async function mostrarProjetos() {
  listaDashboard.replaceChildren();

  const aviso = document.createElement("p");
  aviso.textContent = "Carregando projetos...";
  listaDashboard.append(aviso);

  let projetos;
  try {
    projetos = await lerProjetos();
  } catch (erro) {
    console.error("Não foi possível ler os projetos.", erro);
    aviso.textContent = "Não foi possível carregar os projetos agora. Tente recarregar a página.";
    return;
  }

  listaDashboard.replaceChildren();

  if (projetos.length === 0) {
    const vazio = document.createElement("p");
    vazio.textContent = "Nenhum projeto cadastrado ainda.";
    listaDashboard.append(vazio);
    return;
  }

  projetos.forEach((projeto) => {
    const item = document.createElement("article");
    item.className = "item-dashboard";

    // textContent trata tudo como TEXTO, nunca como HTML. Isso evita ataques (XSS).
    const textos = document.createElement("div");
    const titulo = document.createElement("h3");
    titulo.textContent = projeto.titulo;
    const descricao = document.createElement("p");
    descricao.textContent = projeto.descricao;
    textos.append(titulo, descricao);

    const botaoExcluir = document.createElement("button");
    botaoExcluir.className = "botao-perigo";
    botaoExcluir.type = "button";
    botaoExcluir.textContent = "Excluir";
    botaoExcluir.setAttribute("aria-label", `Excluir ${projeto.titulo}`);
    botaoExcluir.addEventListener("click", async () => {
      botaoExcluir.disabled = true;
      botaoExcluir.textContent = "Excluindo...";

      try {
        const excluiu = await excluirProjeto(projeto.id);
        if (!excluiu) throw new Error("O banco não confirmou a exclusão.");
        mostrarMensagem("Projeto excluído com sucesso.", "sucesso");
        await mostrarProjetos();
      } catch (erro) {
        console.error("Erro ao excluir o projeto.", erro);
        mostrarMensagem("Não foi possível excluir o projeto. Tente novamente.", "erro");
        botaoExcluir.disabled = false;
        botaoExcluir.textContent = "Excluir";
      }
    });

    item.append(textos, botaoExcluir);
    listaDashboard.append(item);
  });
}

formularioProjeto?.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mostrarMensagem("", "");

  if (!cliente) {
    mostrarMensagem("O sistema não carregou. Verifique sua internet e recarregue a página.", "erro");
    return;
  }

  const dados = new FormData(formularioProjeto);
  const projeto = {
    titulo: String(dados.get("titulo")).trim(),
    descricao: String(dados.get("descricao")).trim(),
    imagem: String(dados.get("imagem")).trim(),
    link: String(dados.get("link")).trim(),
  };

  // Imagem e link são opcionais, mas, se vierem preenchidos, precisam ser http(s).
  if (projeto.imagem && !ehUrlSegura(projeto.imagem)) {
    mostrarMensagem("A imagem precisa ser um endereço que comece com http:// ou https://.", "erro");
    return;
  }
  if (projeto.link && !ehUrlSegura(projeto.link)) {
    mostrarMensagem("O link precisa ser um endereço que comece com http:// ou https://.", "erro");
    return;
  }

  const botaoSalvar = formularioProjeto.querySelector('button[type="submit"]');
  botaoSalvar.disabled = true;
  botaoSalvar.textContent = "Salvando...";

  try {
    await salvarProjeto(projeto);
    formularioProjeto.reset();
    mostrarMensagem("Projeto salvo com sucesso.", "sucesso");
    await mostrarProjetos();
  } catch (erro) {
    console.error("Erro ao salvar o projeto.", erro);
    mostrarMensagem(
      "Não foi possível salvar o projeto. Confira os dados e tente novamente.",
      "erro",
    );
  } finally {
    botaoSalvar.disabled = false;
    botaoSalvar.textContent = "Salvar projeto";
  }
});

botaoSair?.addEventListener("click", () => {
  sessionStorage.clear(); // apaga usuário e senha guardados
  window.location.href = "login.html";
});

// Só carrega a lista se houver sessão (senão a página já está indo para o login).
if (temSessao && cliente) {
  mostrarProjetos();
}
