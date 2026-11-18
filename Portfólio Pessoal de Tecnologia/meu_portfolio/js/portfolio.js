// Lê os projetos adicionados no painel e os exibe depois dos projetos iniciais.
function lerProjetosLocais() {
  try {
    return JSON.parse(localStorage.getItem("projetos")) || [];
  } catch (erro) {
    console.error("Não foi possível ler os projetos salvos.", erro);
    return [];
  }
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

  if (projeto.imagem) {
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

  const titulo = document.createElement("h3");
  titulo.textContent = projeto.titulo;

  const descricao = document.createElement("p");
  descricao.textContent = projeto.descricao;

  const link = document.createElement("a");
  link.className = "botao botao-secundario";
  link.href = projeto.link || "#";
  link.textContent = "Detalhes";
  link.setAttribute("aria-label", `Ver detalhes de ${projeto.titulo}`);
  if (projeto.link) {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }

  artigo.append(metadados, titulo, descricao, link);
  return artigo;
}

const listaProjetos = document.querySelector("#lista-projetos");

if (listaProjetos) {
  lerProjetosLocais().forEach((projeto) => {
    listaProjetos.append(criarCardProjeto(projeto));
  });
}
