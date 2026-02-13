const form = document.getElementById('formLogin');
const mensagemDiv = document.getElementById('mensagem');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  try {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });

    const data = await response.json();

    if (!response.ok) {
      mostrarMensagem(data.erro || 'Erro ao fazer login', 'erro');
      return;
    }

    // 🔐 salvar token (vamos usar depois)
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuarioNome', data.usuario.nome);
    localStorage.setItem('usuarioTipo', data.usuario.tipo);

    if (data.usuario.tipo === 'admin') {
      window.location.href = '/frontend/admin/admin.html';
      return;
    }
    else{
      window.location.href = '/frontend/paciente/index.html';
      return;
    }

    mostrarMensagem('Login realizado com sucesso!', 'sucesso');

    // redirecionar (ex: tela principal)
    setTimeout(() => {
      window.location.href = '/frontend/paciente/index.html';
    }, 1000);

  } catch (error) {
    mostrarMensagem('Erro de conexão com o servidor', 'erro');
  }
});

function mostrarMensagem(texto, tipo) {
  mensagemDiv.innerText = texto;
  mensagemDiv.className = `mensagem ${tipo}`;
  mensagemDiv.style.display = 'block';
}
