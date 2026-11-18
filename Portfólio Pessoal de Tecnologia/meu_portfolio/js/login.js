// ATENÇÃO: este login é apenas uma simulação para um projeto escolar.
// Em um site real, guardar usuário e senha no JavaScript não é seguro, porque
// qualquer pessoa pode abrir o código no navegador. O correto é validar no servidor.
const USUARIO_VALIDO = "emanuel";
const SENHA_VALIDA = "1234";

const formularioLogin = document.querySelector("#formulario-login");
const mensagemLogin = document.querySelector("#mensagem-login");

formularioLogin?.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const dados = new FormData(formularioLogin);
  const usuario = String(dados.get("usuario")).trim();
  const senha = String(dados.get("senha"));

  if (usuario === USUARIO_VALIDO && senha === SENHA_VALIDA) {
    sessionStorage.setItem("usuarioAutenticado", "true");
    window.location.href = "dashboard.html";
    return;
  }

  mensagemLogin.textContent = "Usuário ou senha não conferem. Revise os dados e tente novamente.";
});
