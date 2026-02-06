/* ==========================
   ELEMENTOS
========================== */
const form = document.getElementById("formAgendamento");
const lista = document.getElementById("listaAgendamentos");
const mensagemDiv = document.getElementById("mensagem");
const inputId = document.getElementById("id");
const btnLogout = document.getElementById("btnLogout");

const selectEspecialidade = document.getElementById("especialidade");
const selectMedico = document.getElementById("medico");

const bemvindo = document.getElementById("bemvindo");

/* ==========================
   CONFIG
========================== */
const API_URL = "http://127.0.0.1:3000/agendamentos";
const MEDICOS_URL = "http://127.0.0.1:3000/medicos";

const token = localStorage.getItem("token");
const nomeUsuario = localStorage.getItem("usuarioNome");

/* ==========================
   LOGIN
========================== */
if (bemvindo && nomeUsuario) {
  bemvindo.innerText = `Bem-vindo, ${nomeUsuario}!`;
}

if (!token) {
  alert("Sessão expirada. Faça login novamente.");
  window.location.href = "login.html";
}

/* ==========================
   UTIL
========================== */
function mostrarMensagem(texto, erro = false) {
  if (!mensagemDiv) return;

  mensagemDiv.innerText = texto;
  mensagemDiv.style.display = "block";
  mensagemDiv.style.background = erro ? "#f8d7da" : "#d4edda";
  mensagemDiv.style.color = erro ? "#721c24" : "#155724";

  setTimeout(() => {
    mensagemDiv.style.display = "none";
  }, 3000);
}

function tratarErroAuth(res) {
  if (res.status === 401) {
    localStorage.removeItem("token");
    alert("Sessão expirada. Faça login novamente.");
    window.location.href = "login.html";
    return true;
  }
  return false;
}

/* ==========================
   ESPECIALIDADES
========================== */
async function carregarEspecialidades() {
  try {
    const res = await fetch(MEDICOS_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error();

    const medicos = await res.json();

    const especialidades = [
      ...new Set(medicos.map((m) => m.especialidade)),
    ];

    selectEspecialidade.innerHTML =
      '<option value="">Selecione a especialidade</option>';

    especialidades.forEach((esp) => {
      const option = document.createElement("option");
      option.value = esp;
      option.textContent = esp;
      selectEspecialidade.appendChild(option);
    });
  } catch {
    mostrarMensagem("Erro ao carregar especialidades", true);
  }
}

/* ==========================
   MÉDICOS POR ESPECIALIDADE
========================== */
async function carregarMedicosPorEspecialidade(especialidade) {
  try {
    const res = await fetch(MEDICOS_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error();

    const medicos = await res.json();

    const filtrados = medicos.filter(
      (m) => m.especialidade === especialidade
    );

    selectMedico.innerHTML =
      '<option value="">Selecione um médico</option>';
    selectMedico.disabled = false;

    filtrados.forEach((medico) => {
      const option = document.createElement("option");
      option.value = medico.id;
      option.textContent = medico.nome;
      selectMedico.appendChild(option);
    });
  } catch {
    mostrarMensagem("Erro ao carregar médicos", true);
  }
}

/* ==========================
   EVENTOS SELECT
========================== */
selectEspecialidade.addEventListener("change", () => {
  const especialidade = selectEspecialidade.value;

  selectMedico.innerHTML =
    '<option value="">Selecione um médico</option>';
  selectMedico.disabled = true;

  if (!especialidade) return;

  carregarMedicosPorEspecialidade(especialidade);
});

/* ==========================
   LISTAR AGENDAMENTOS
========================== */
async function carregarAgendamentos() {
  lista.innerHTML = "<li>Carregando...</li>";

  try {
    const res = await fetch(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (tratarErroAuth(res)) return;
    if (!res.ok) throw new Error();

    const agendamentos = await res.json();
    lista.innerHTML = "";

    if (agendamentos.length === 0) {
      lista.innerHTML = "<li>Nenhum agendamento encontrado.</li>";
      return;
    }

    agendamentos.forEach((ag) => {
      const li = document.createElement("li");
      const data = new Date(ag.data).toLocaleDateString("pt-BR");

      li.innerHTML = `
        <strong>${ag.medico_nome}</strong>
        <div>${ag.medico_especialidade}</div>
        <div>${data} às ${ag.horario}</div>

        <div class="acoes">
          <button class="btn-excluir" data-id="${ag.id}">Excluir</button>
        </div>
      `;

      lista.appendChild(li);
    });
  } catch {
    mostrarMensagem("Erro ao buscar agendamentos", true);
  }
}

/* ==========================
   CRIAR AGENDAMENTO
========================== */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!selectEspecialidade.value) {
    mostrarMensagem("Selecione a especialidade", true);
    return;
  }

  if (!selectMedico.value) {
    mostrarMensagem("Selecione um médico", true);
    return;
  }

  const agendamento = {
    medico_id: selectMedico.value,
    data: document.getElementById("data").value,
    horario: document.getElementById("horario").value,
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(agendamento),
    });

    if (tratarErroAuth(res)) return;
    if (!res.ok) throw new Error();

    mostrarMensagem("Agendamento criado com sucesso!");
    form.reset();
    selectMedico.disabled = true;

    carregarAgendamentos();
  } catch {
    mostrarMensagem("Erro ao salvar agendamento", true);
  }
});

/* ==========================
   EXCLUIR
========================== */
lista.addEventListener("click", async (e) => {
  const id = e.target.dataset.id;
  if (!id) return;

  if (!confirm("Deseja excluir este agendamento?")) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (tratarErroAuth(res)) return;
    if (!res.ok) throw new Error();

    mostrarMensagem("Agendamento excluído!");
    carregarAgendamentos();
  } catch {
    mostrarMensagem("Erro ao excluir agendamento", true);
  }
});

/* ==========================
   LOGOUT
========================== */
btnLogout.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "login.html";
});

/* ==========================
   START
========================== */
selectMedico.disabled = true;
carregarEspecialidades();
carregarAgendamentos();
