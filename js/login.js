import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

// ATENÇÃO: este login ainda é uma versão simples para um projeto escolar.
// Guardar usuário e senha no sessionStorage NÃO é o jeito mais seguro: qualquer
// pessoa com acesso ao seu navegador aberto poderia ver esses dados. Fazemos isso
// só para reenviar as credenciais às funções do banco, que conferem tudo no
// servidor. Em um site real, o correto é usar um sistema de autenticação com tokens.

const formularioLogin = document.querySelector("#formulario-login");
const mensagemLogin = document.querySelector("#mensagem-login");
const botaoEntrar = formularioLogin?.querySelector('button[type="submit"]');

// "supabase" vem da biblioteca carregada pelo CDN no login.html.
// Se ela não carregou (internet ruim, por exemplo), avisamos em vez de quebrar.
const cliente = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

formularioLogin?.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mensagemLogin.textContent = "";

  if (!cliente) {
    mensagemLogin.textContent =
      "Não foi possível carregar o sistema de login. Verifique sua internet e recarregue a página.";
    return;
  }

  const dados = new FormData(formularioLogin);
  const usuario = String(dados.get("usuario")).trim();
  const senha = String(dados.get("senha"));

  // Desabilita o botão para evitar cliques repetidos enquanto espera a resposta.
  botaoEntrar.disabled = true;
  botaoEntrar.textContent = "Entrando...";

  try {
    // Chama a função login(p_usuario, p_senha) que existe no banco.
    const { data, error } = await cliente.rpc("login", {
      p_usuario: usuario,
      p_senha: senha,
    });

    if (error) throw error;

    if (data === true) {
      // Guarda só durante esta aba aberta (sessionStorage some ao fechar a aba).
      sessionStorage.setItem("usuarioLogin", usuario);
      sessionStorage.setItem("senhaLogin", senha);
      window.location.href = "dashboard.html";
      return;
    }

    mensagemLogin.textContent = "Usuário ou senha não conferem. Revise os dados e tente novamente.";
  } catch (erro) {
    console.error("Erro ao fazer login.", erro);
    mensagemLogin.textContent = "Não foi possível entrar agora. Tente novamente em instantes.";
  } finally {
    botaoEntrar.disabled = false;
    botaoEntrar.textContent = "Entrar";
  }
});
