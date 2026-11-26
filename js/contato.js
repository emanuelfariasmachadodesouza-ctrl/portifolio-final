import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

// Limites iguais aos do banco de dados.
const LIMITE_NOME = 100;
const LIMITE_EMAIL = 150;
const LIMITE_MENSAGEM = 1000;

const formulario = document.querySelector("#formulario-contato");
const mensagemContato = document.querySelector("#mensagem-contato");
const campoMensagem = document.querySelector("#contato-mensagem");
const contador = document.querySelector("#contador-mensagem");

// "supabase" vem da biblioteca carregada pelo CDN no contato.html.
const cliente = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Mostra uma mensagem verde (sucesso) ou vermelha (erro) abaixo do formulário.
function mostrarMensagem(texto, tipo) {
  mensagemContato.textContent = texto;
  mensagemContato.classList.toggle("sucesso", tipo === "sucesso");
  mensagemContato.classList.toggle("erro", tipo === "erro");
}

// Atualiza o contador de caracteres enquanto a pessoa digita.
function atualizarContador() {
  contador.textContent = `${campoMensagem.value.length} / ${LIMITE_MENSAGEM} caracteres`;
}
campoMensagem?.addEventListener("input", atualizarContador);

formulario?.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mostrarMensagem("", "");

  const dados = new FormData(formulario);

  // Se o campo-armadilha veio preenchido, é um robô: finge sucesso e não envia.
  if (String(dados.get("site")).trim() !== "") {
    formulario.reset();
    mostrarMensagem("Mensagem enviada com sucesso. Obrigado pelo contato!", "sucesso");
    return;
  }

  if (!cliente) {
    mostrarMensagem("O envio não está disponível agora. Recarregue a página e tente de novo.", "erro");
    return;
  }

  const nome = String(dados.get("nome")).trim();
  const email = String(dados.get("email")).trim();
  const mensagem = String(dados.get("mensagem")).trim();

  // Confere de novo no JavaScript (o HTML pode ser alterado por quem quiser).
  if (!nome || !email || !mensagem) {
    mostrarMensagem("Preencha nome, e-mail e o problema.", "erro");
    return;
  }
  if (nome.length > LIMITE_NOME || email.length > LIMITE_EMAIL || mensagem.length > LIMITE_MENSAGEM) {
    mostrarMensagem(
      `Limites: nome até ${LIMITE_NOME}, e-mail até ${LIMITE_EMAIL} e mensagem até ${LIMITE_MENSAGEM} caracteres.`,
      "erro",
    );
    return;
  }

  const botao = formulario.querySelector('button[type="submit"]');
  botao.disabled = true;
  botao.textContent = "Enviando...";

  try {
    // Insere uma linha em leads. Sem .select(): visitantes só podem inserir, não ler.
    const { error } = await cliente.from("leads").insert({
      nome,
      email,
      mensagem,
      origem: "contato",
    });

    if (error) throw error;

    formulario.reset();
    atualizarContador();
    mostrarMensagem("Mensagem enviada com sucesso. Obrigado pelo contato!", "sucesso");
  } catch (erro) {
    console.error("Erro ao enviar a mensagem.", erro);
    mostrarMensagem(
      "Não foi possível enviar sua mensagem agora. Tente novamente em instantes.",
      "erro",
    );
  } finally {
    botao.disabled = false;
    botao.textContent = "Enviar mensagem";
  }
});
