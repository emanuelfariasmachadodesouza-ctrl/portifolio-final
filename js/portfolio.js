import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

// Aceita somente endereços que começam com http:// ou https://.
// Os dados do banco não são 100% confiáveis, então conferimos também aqui.
function ehUrlSegura(texto) {
  try {
    const url = new URL(texto);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// Lê os projetos publicados no banco, do mais novo para o mais antigo.
async function lerProjetosDoBanco() {
  const cliente = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data, error } = await cliente
    .from("projetos")
    .select("id, titulo, descricao, imagem, link, criado_em")
    .order("criado_em", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

function criarEtiqueta(texto) {
  const etiqueta = document.createElement("span");
  etiqueta.className = "etiqueta";
  etiqueta.textContent = texto;
  return etiqueta;
}

function criarCardProjeto(projeto) {
  const artigo = document.createElement("article");
  artigo.className = "projeto";

  // Só mostra a imagem se o endereço for http(s).
  if (projeto.imagem && ehUrlSegura(projeto.imagem)) {
    const imagem = document.createElement("img");
    imagem.className = "projeto-imagem";
    imagem.src = projeto.imagem;
    imagem.alt = `Imagem do projeto ${projeto.titulo}`;
    imagem.loading = "lazy";
    artigo.append(imagem);
  }

  const metadados = document.createElement("div");
  metadados.className = "metadados-projeto";
  metadados.append(criarEtiqueta("Projeto cadastrado"), criarEtiqueta("Publicado"));

  // textContent mostra tudo como texto puro (nunca como HTML).
  const titulo = document.createElement("h3");
  titulo.textContent = projeto.titulo;

  const descricao = document.createElement("p");
  descricao.textContent = projeto.descricao;

  const link = document.createElement("a");
  link.className = "botao botao-secundario";
  link.textContent = "Detalhes";
  link.setAttribute("aria-label", `Ver detalhes de ${projeto.titulo}`);

  if (projeto.link && ehUrlSegura(projeto.link)) {
    link.href = projeto.link;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  } else {
    link.href = "#";
  }

  artigo.append(metadados, titulo, descricao, link);
  return artigo;
}

// Cria um aviso (de erro ou informação) logo abaixo da lista de projetos.
function mostrarAviso(listaProjetos, texto) {
  const aviso = document.createElement("p");
  aviso.className = "mensagem erro";
  aviso.setAttribute("role", "status");
  aviso.textContent = texto;
  listaProjetos.after(aviso);
}

async function carregarProjetos() {
  const listaProjetos = document.querySelector("#lista-projetos");
  if (!listaProjetos) return;

  // Se a biblioteca não carregou, os cards fixos continuam normais.
  if (!window.supabase) {
    mostrarAviso(
      listaProjetos,
      "Não foi possível carregar os projetos cadastrados agora. Os projetos acima continuam disponíveis.",
    );
    return;
  }

  try {
    const projetos = await lerProjetosDoBanco();
    projetos.forEach((projeto) => {
      listaProjetos.append(criarCardProjeto(projeto));
    });
  } catch (erro) {
    console.error("Não foi possível ler os projetos do banco.", erro);
    mostrarAviso(
      listaProjetos,
      "Não foi possível carregar os projetos cadastrados agora. Tente novamente mais tarde.",
    );
  }
}

carregarProjetos();
