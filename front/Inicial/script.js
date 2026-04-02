window.addEventListener("DOMContentLoaded", () => {
    const corpo = document.querySelector("#corpo")
    const cargo = localStorage.getItem("cargo");
    if (cargo =="cozinha" || cargo == "Inspetor") {
        const setor = document.createElement("div"); //cria uma div para a tarefa
        setor.className = "cozinha"; //define a classe da div como tarefas
        setor.innerHTML += `
        
        <a href="../Area_Contagem/index.html"><div class="area_cozinha">
          <img class="fundoI"
            src="https://th.bing.com/th/id/R.b67b76a0441ed6e9e56b8a801a892731?rik=JB0p1PFsdKyEwA&pid=ImgRaw&r=0" alt=""
            srcset="" />
          <div class="mensagem">
            <h2>Contagem_Alunos</h2>
          </div>
        </div></a>

    `; 
    corpo.appendChild(setor)
    }
})