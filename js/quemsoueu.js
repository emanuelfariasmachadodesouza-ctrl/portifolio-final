import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

// Limites iguais aos do banco de dados.
const LIMITE_NOME = 100;
const LIMITE_EMAIL = 150;
const LIMITE_MENSAGEM = 1000;

const formularioContato = document.querySelector("#formulario-contato");
const mensagemContato = document.querySelector("#mensagem-contato");

const cliente = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Mostra uma mensagem verde (sucesso) ou vermelha (erro) abaixo do formulário.
function mostrarMensagem(texto, tipo) {
  mensagemContato.textContent = texto;
  mensagemContato.classList.toggle("sucesso", tipo === "sucesso");
  mensagemContato.classList.toggle("erro", tipo === "erro");
}

formularioContato?.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mostrarMensagem("", "");

  if (!cliente) {
    mostrarMensagem("O envio não está disponível agora. Recarregue a página e tente de novo.", "erro");
    return;
  }

  const dados = new FormData(formularioContato);
  const nome = String(dados.get("nome")).trim();
  const email = String(dados.get("email")).trim();
  const mensagem = String(dados.get("mensagem")).trim();

  // Confere de novo no JavaScript (o HTML pode ser alterado por quem quiser).
  if (!nome || !email || !mensagem) {
    mostrarMensagem("Preencha nome, e-mail e mensagem.", "erro");
    return;
  }
  if (nome.length > LIMITE_NOME || email.length > LIMITE_EMAIL || mensagem.length > LIMITE_MENSAGEM) {
    mostrarMensagem(
      `Limites: nome até ${LIMITE_NOME}, e-mail até ${LIMITE_EMAIL} e mensagem até ${LIMITE_MENSAGEM} caracteres.`,
      "erro",
    );
    return;
  }

  const botaoEnviar = formularioContato.querySelector('button[type="submit"]');
  botaoEnviar.disabled = true;
  botaoEnviar.textContent = "Enviando...";

  try {
    // Insere uma linha na tabela leads. Não pedimos o dado de volta (sem .select()),
    // porque visitantes só têm permissão de inserir, não de ler.
    const { error } = await cliente.from("leads").insert({
      nome,
      email,
      mensagem,
      origem: "quemsoueu",
    });

    if (error) throw error;

    formularioContato.reset();
    mostrarMensagem("Mensagem enviada com sucesso. Obrigado pelo contato!", "sucesso");
  } catch (erro) {
    console.error("Erro ao enviar a mensagem.", erro);
    mostrarMensagem(
      "Não foi possível enviar sua mensagem agora. Tente novamente em instantes.",
      "erro",
    );
  } finally {
    botaoEnviar.disabled = false;
    botaoEnviar.textContent = "Enviar mensagem";
  }
});
