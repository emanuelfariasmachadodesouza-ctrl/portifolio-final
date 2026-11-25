
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY
} from "./config.js";

const formulario = document.querySelector("#formulario-contato");
const mensagemStatus = document.querySelector("#mensagem-contato");

const LIMITE_NOME = 100;
const LIMITE_EMAIL = 150;
const LIMITE_MENSAGEM = 1000;

const cliente = window.supabase
  ? window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    )
  : null;

function mostrarMensagem(texto, tipo) {
  mensagemStatus.textContent = texto;

  mensagemStatus.classList.toggle(
    "sucesso",
    tipo === "sucesso"
  );

  mensagemStatus.classList.toggle(
    "erro",
    tipo === "erro"
  );
}

formulario?.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  mostrarMensagem("", "");

  if (!cliente) {
    mostrarMensagem(
      "Sistema indisponível. Tente novamente mais tarde.",
      "erro"
    );
    return;
  }

  const dados = new FormData(formulario);

  const nome = String(dados.get("nome")).trim();
  const email = String(dados.get("email")).trim();
  const servico = String(dados.get("servico")).trim();
  const descricao = String(dados.get("mensagem")).trim();

  if (!nome || !email || !servico || !descricao) {
    mostrarMensagem(
      "Preencha todos os campos obrigatórios.",
      "erro"
    );
    return;
  }

  if (
    nome.length > LIMITE_NOME ||
    email.length > LIMITE_EMAIL
  ) {
    mostrarMensagem(
      "Confira os limites de caracteres dos campos.",
      "erro"
    );
    return;
  }

  const mensagem = `Serviço solicitado: ${servico}\n\nDescrição: ${descricao}`;

  if (mensagem.length > LIMITE_MENSAGEM) {
    mostrarMensagem(
      "A descrição ultrapassou o limite permitido.",
      "erro"
    );
    return;
  }

  const botao = formulario.querySelector(
    'button[type="submit"]'
  );

  botao.disabled = true;
  botao.textContent = "Enviando solicitação...";

  try {
    const { error } = await cliente
      .from("leads")
      .insert({
        nome,
        email,
        mensagem,
        origem: "contato"
      });

    if (error) throw error;

    formulario.reset();

    mostrarMensagem(
      "Solicitação enviada com sucesso! Obrigado pelo contato.",
      "sucesso"
    );

  } catch (erro) {
    console.error("Erro ao enviar solicitação:", erro);

    mostrarMensagem(
      "Não foi possível enviar sua solicitação. Tente novamente.",
      "erro"
    );

  } finally {
    botao.disabled = false;
    botao.textContent = "Enviar solicitação";
  }
});
