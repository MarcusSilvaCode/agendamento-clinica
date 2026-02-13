const lista = document.getElementById("listaAdmin");
const btnLogout = document.getElementById("btnLogout");

const API_URL = "http://127.0.0.1:3000/agendamento/admin";
const token = localStorage.getItem("token");
const usuarioTipo = localStorage.getItem("usuarioTipo");

if (usuarioTipo !== "admin") {
  alert("Acesso restrito a administradores.");
  window.location.href = "/frontend/auth/login.html";
} 

if (!token) {
  alert("Faça login novamente.");
  window.location.href = "/frontend/auth/login.html";
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuarioNome");
  window.location.href = "/frontend/auth/login.html";
}

btnLogout.addEventListener("click", logout);

async function carregarAgendamentosAdmin() {
  try {
    const res = await fetch("http://127.0.0.1:3000/agendamento/admin", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    const dados = await res.json();

    const tbody = document.getElementById("listaAdmin");
    tbody.innerHTML = "";

    let total = 0;
    let confirmados = 0;
    let cancelados = 0;

    dados.forEach(ag => {
      total++;

      if (ag.status === "confirmado") confirmados++;
      if (ag.status === "cancelado") cancelados++;

      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${ag.paciente_nome}</td>
        <td>${ag.medico_nome}</td>
        <td>${ag.especialidade}</td>
        <td>${new Date(ag.data).toLocaleDateString("pt-BR")}</td>
        <td>${ag.hora}</td>
        <td>
          <span class="status ${ag.status}">
            ${ag.status}
          </span>
        </td>
      `;

      tbody.appendChild(tr);
    });

    document.getElementById("totalAgendamentos").innerText = total;
    document.getElementById("totalConfirmados").innerText = confirmados;
    document.getElementById("totalCancelados").innerText = cancelados;

  } catch (erro) {
    console.error(erro);
  }
}

carregarAgendamentosAdmin();

async function alterarStatus(id, novoStatus) {
  try {
    const res = await fetch(
      `http://127.0.0.1:3000/agendamento/admin/${id}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: novoStatus }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.erro || "Erro");
      return;
    }

    alert("Status atualizado!");
    carregarAgendamentosAdmin();

  } catch (error) {
    alert("Erro ao atualizar status");
  }
}

carregarAdmin();
