// Protege apenas a navegação desta demonstração. Uma aplicação real precisa
// conferir a autenticação também no servidor.
if (sessionStorage.getItem("usuarioAutenticado") !== "true") {
  window.location.replace("login.html");
}

// Estas três funções isolam o acesso aos dados. No futuro, você pode trocar
// o localStorage por chamadas a um banco sem alterar toda a interface.
function lerProjetos() {
  try {
    return JSON.parse(localStorage.getItem("projetos")) || [];
  } catch (erro) {
    console.error("Não foi possível ler os projetos.", erro);
    return [];
  }
}

function salvarProjeto(projeto) {
  const projetos = lerProjetos();
  projetos.push(projeto);
  localStorage.setItem("projetos", JSON.stringify(projetos));
}

function excluirProjeto(id) {
  const projetosAtualizados = lerProjetos().filter((projeto) => projeto.id !== id);
  localStorage.setItem("projetos", JSON.stringify(projetosAtualizados));
}

const formularioProjeto = document.querySelector("#formulario-projeto");
const mensagemProjeto = document.querySelector("#mensagem-projeto");
const listaDashboard = document.querySelector("#lista-dashboard");
const botaoSair = document.querySelector("#botao-sair");

function mostrarProjetos() {
  const projetos = lerProjetos();
  listaDashboard.replaceChildren();

  if (projetos.length === 0) {
    const aviso = document.createElement("p");
    aviso.textContent = "Nenhum projeto cadastrado ainda.";
    listaDashboard.append(aviso);
    return;
  }

  projetos.forEach((projeto) => {
    const item = document.createElement("article");
    item.className = "item-dashboard";

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
    botaoExcluir.addEventListener("click", () => {
      excluirProjeto(projeto.id);
      mostrarProjetos();
    });

    item.append(textos, botaoExcluir);
    listaDashboard.append(item);
  });
}

formularioProjeto?.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const dados = new FormData(formularioProjeto);

  salvarProjeto({
    id: crypto.randomUUID(),
    titulo: String(dados.get("titulo")).trim(),
    descricao: String(dados.get("descricao")).trim(),
    imagem: String(dados.get("imagem")).trim(),
    link: String(dados.get("link")).trim(),
  });

  formularioProjeto.reset();
  mensagemProjeto.textContent = "Projeto salvo com sucesso.";
  mostrarProjetos();
});

botaoSair?.addEventListener("click", () => {
  sessionStorage.removeItem("usuarioAutenticado");
  window.location.href = "login.html";
});

mostrarProjetos();
