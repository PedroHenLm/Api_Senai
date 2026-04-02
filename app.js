import express from "express"; 
import cors from "cors"; 
import sql from "./database.js"; 
import {CriarHash} from "./utils.js"

// nesse codigo estamos importando as bibliotecas necessarias para criar um servidor web com express, permitir requisições de diferentes origens com cors e conectar ao banco de dados com sql.

const app = express();  // cria uma constante 'app' que representa a aplicação Express
app.use(express.json()); // pega a constante 'app' e configura para usar o middleware que permite o parsing de JSON no corpo das requisições
app.use(cors()); // configura a aplicação para usar o middleware CORS

//nesse trecho estamos criando a aplicação express e configurando ela para entender requisições com corpo em JSON e permitir requisições de diferentes origens.

// Rota para cadastro de novo usuario.
app.post("/cadastro/novo", async (req, res) => { 
  const { senha, nome, email, cargo } = req.body; 

  const hash = await CriarHash(senha, 10)

  console.log("cadastrado"); //mostra no console a mensagem "cadastrado"
  const cadastro = // cria uma constante 'cadastro' que armazena o resultado da consulta SQL
    await sql`INSERT INTO usuario(email, nome, cargo, senha ) values(${email}, ${nome}, ${cargo}, ${hash} )`; // armazena no banco de dados os dados do novo usuário
  return res.status(200).json(cadastro[0]); //retorna uma resposta de sucesso com os dados do usuário em formato JSON
});


// Rota validação de Login.
app.post("/login/", async (req, res) => { 
  const { email, senha } = req.body; 
  const entrar = await sql`select * from usuario where email = ${email}`;
  if (entrar[0]) { 
    const verificar = 
      await sql`select * from usuario where email =${email} and senha= ${senha}`;
    if (verificar[0]) {
      return res.status(200).json(verificar[0]); 
    }
    return res.status(401).json({ message: "Usuário ou senha incorreto" });
  }
   else {
    return res.status(404).json("Usuário não encontrado");
  }
});

app.put("/mudarSenha", async (req, res) => {  
  const { senha, senha_N, id_usuario } = req.body;

  const trocar = await sql`SELECT senha FROM usuario where id_usuario = ${id_usuario} and senha = ${senha}`;

  if (trocar.length != 0) {
    await sql`UPDATE usuario SET senha = ${senha_N} WHERE id_usuario = ${id_usuario};`
    return res.status(201).json({message : "teste"});
  }
  return res.status(401).json({ message: "bla" });
})

app.post("/checklist", async (req, res) => {
  const { funcao, data, localizacao, urgencia, id_usuario, prazo, responsavel} = req.body 

  const criar = await sql `INSERT INTO requisicao(nivel_urgencia, funcao, data_requisicao, localizacao, id_usuario, prazo, destinatario_req) VALUES(${urgencia}, ${funcao}, ${data}, ${localizacao}, ${id_usuario}, ${prazo}, ${responsavel})`;
  return res.status(200).json(criar[0])
})

app.get("/MostrarTarefa/:cargo", async (req, res) => {
  const {cargo} = req.params
  const mostrar = await sql `SELECT * FROM requisicao 
where requisicao.localizacao = ${cargo}`
 return res.status(200).json(mostrar)
})

app.get("/ListarUsers", async (req, res) => { 
  const listar = await sql `SELECT id_usuario, nome FROM usuario;`
  return res.status(200).json(listar)
})

app.delete("/Apagar_Req/:id", async(req, res)=>{
  const {id}= req.params
  const apagar = await sql `DELETE FROM requisicao
WHERE id_requisicao = ${id};
`
return res.status(200).json(apagar)
})

app.put("/Editar_Req/:id", async (req, res) => {
  const {id} = req.params
  const {funcao, data, localizacao, urgencia, prazo, responsavel } = req.body
  const editar = await sql `UPDATE requisicao
	SET nivel_urgencia=${urgencia}, funcao=${funcao}, data_requisicao=${data}, localizacao=${localizacao}, prazo=${prazo}, destinatario_req=${responsavel}
	WHERE id_requisicao = ${id}`
  return res.status(200).json(editar)
})

app.get("/Historico/:id", async (req, res) => {
  const {id} = req.params
  const buscar = await sql `SELECT * from requisicao where id_usuario = ${id}
`
  return res.status(200).json(buscar)
})

app.listen(3000, () => {
  console.log("Cu");
});
