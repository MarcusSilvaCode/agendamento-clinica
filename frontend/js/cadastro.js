const form = document.getElementById('formCadastro');
const mensagemDiv = document.getElementById('mensagem');

const API_URL = 'http://127.0.0.1:3000/auth/register';

function mostrarMensagem(texto, erro = false) {
  mensagemDiv.innerText = texto;
  mensagemDiv.style.display = 'block';
  mensagemDiv.style.background = erro ? '#f8d7da' : '#d4edda';
  mensagemDiv.style.color = erro ? '#721c24' : '#155724';

  setTimeout(() => {
    mensagemDiv.style.display = 'none';
  }, 3000);
}

form.addEventListener('submit', async e => {
  e.preventDefault();

  const usuario = {
    nome: document.getElementById('nome').value,
    email: document.getElementById('email').value,
    senha: document.getElementById('senha').value
  };

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(usuario)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.erro || 'Erro ao cadastrar');
    }

    mostrarMensagem('Cadastro realizado com sucesso!');

    setTimeout(() => {
      window.location.href = '/frontend/auth/login.html';
    }, 1500);

  } catch (err) {
    mostrarMensagem(err.message, true);
  }
});
