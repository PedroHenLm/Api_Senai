import express from "express";
import cors from "cors";
import sql from "./database.js";
import { CriarHash, CompararHash } from "./utils.js";

// nesse codigo estamos importando as bibliotecas necessarias para criar um servidor web com express, permitir requisições de diferentes origens com cors e conectar ao banco de dados com sql.

const app = express(); // cria uma constante 'app' que representa a aplicação Express
app.use(express.json({ limit: '50mb' })); // Aumenta limite para 50MB
app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));
app.use(cors());

//nesse trecho estamos criando a aplicação express e configurando ela para entender requisições com corpo em JSON e permitir requisições de diferentes origens.

app.post("/cadastro/novo", async (req, res) => {
  const { senha, nome, email, cargo } = req.body;

  const regexSenha =/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])^[\x21-\x7e]{8,255}$/;
  const regexNome = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/;
  const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  try {
    console.log(senha, nome, email, cargo)
    
    if (!senha || !nome || !email || !cargo) {
      return res.status(400).json("Preencha todos os campos!");
    }
    if (!regexSenha.test(senha)) {
      return res.status(400).json("Preencha todos os campos!");
    }
    if (!regexNome.test(nome)) {
      return res.status(400).json("Preencha todos os campos");
    }
    if (!regexEmail.test(email)) {
      return res.status(400).json("Preencha todos os campos!");
    }

    const usuarioExistente = await sql`SELECT id_usuario FROM usuario WHERE email = ${email}`;
    
    if (usuarioExistente.length > 0) {
      return res.status(404).json("Este e-mail já está cadastrado!");
    }

    const hash = await CriarHash(senha, 10);
    console.log("cadastrado"); //mostra no console a mensagem "cadastrado"
    const cadastro = // cria uma constante 'cadastro' que armazena o resultado da consulta SQL
      await sql`INSERT INTO usuario(email, nome, cargo, senha ) values(${email}, ${nome}, ${cargo}, ${hash} )`; // armazena no banco de dados os dados do novo usuário
    return res.status(200).json(cadastro[0]); //retorna uma resposta de sucesso com os dados do usuário em formato JSON
  } catch (error) {
    console.error("Erro ao Cadastrar a Conta: " + error);
    return res.status(500).json("Erro inesperado");
  }
});

// Rota validação de Login.
app.post("/login/", async (req, res) => {
  const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const regexSenha =
    /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])^[\x21-\x7e]{8,255}$/;
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json("Preencha todos os campos!");
    }
    if (!regexEmail.test(email)) {
      return res.status(400).json("Preencha todos os campos!");
    }
    if (!regexSenha.test(senha)) {
      return res.status(400).json("Preencha todos os campos!");
    }
    const entrar = await sql`select * from usuario where email = ${email}`;
    if (entrar[0]) {
      const teste = await CompararHash(senha, entrar[0].senha);
      if (teste) {
        return res.status(200).json(entrar[0]);
      }
      return res.status(401).json({ message: "Usuário ou senha incorreto" });
    } else {
      return res.status(404).json("Usuário não encontrado");
    }
  } catch (error) {
    console.error("Erro ao entrar na conta: " + error);
    return res.status(500).json("Erro inesperado");
  }
});

app.put("/mudarSenha", async (req, res) => {
  const { senha, senha_N, id_usuario } = req.body;
  const trocar =
    await sql`SELECT senha FROM usuario where id_usuario = ${id_usuario}`;
  const compar = CompararHash(senha, trocar[0].senha);

  if (compar) {
    const hash = await CriarHash(senha_N, 10);
    await sql`UPDATE usuario SET senha = ${hash} WHERE id_usuario = ${id_usuario};`;
    return res.status(201).json({ message: "teste" });
  }
  return res.status(401).json({ message: "bla" });
});

app.post("/checklist", async (req, res) => {
  const {
    funcao,
    data,
    localizacao,
    urgencia,
    id_usuario,
    prazo,
    responsavel,
  } = req.body;

  const criar =
    await sql`INSERT INTO requisicao(nivel_urgencia, funcao, data_requisicao, localizacao, id_usuario, prazo, destinatario_req) VALUES(${urgencia}, ${funcao}, ${data}, ${localizacao}, ${id_usuario}, ${prazo}, ${responsavel})`;
  return res.status(200).json(criar[0]);
});

app.get("/MostrarTarefa/:cargo", async (req, res) => {
  const { cargo } = req.params;
  const mostrar = await sql`SELECT * FROM requisicao 
where requisicao.localizacao = ${cargo}`;
  return res.status(200).json(mostrar);
});

app.get("/ListarUsers", async (req, res) => {
  const listar = await sql`SELECT * FROM usuario;`;
  return res.status(200).json(listar);
});

app.delete("/Apagar_Req/:id", async (req, res) => {
  const { id } = req.params;
  const apagar = await sql`DELETE FROM requisicao
WHERE id_requisicao = ${id};
`;
  return res.status(200).json(apagar);
});

app.put("/Editar_Req/:id", async (req, res) => {
  const { id } = req.params;
  const { funcao, data, localizacao, urgencia, prazo, responsavel } = req.body;
  const editar = await sql`UPDATE requisicao
	SET nivel_urgencia=${urgencia}, funcao=${funcao}, data_requisicao=${data}, localizacao=${localizacao}, prazo=${prazo}, destinatario_req=${responsavel}
	WHERE id_requisicao = ${id}`;
  return res.status(200).json(editar);
});

app.get("/Historico/:id", async (req, res) => {
  const { id } = req.params;
  const buscar = await sql`SELECT * from requisicao where id_usuario = ${id}
`;
  return res.status(200).json(buscar);
});

app.put("/imagem", async (req, res) => {
  try {
    const { image, id_usuario } = req.body; // Recebe a imagem base64 e o id do usuário
    
    if (!image) {
      return res.status(400).json({ message: "Nenhuma imagem enviada" });
    }
    
    if (!id_usuario) {
      return res.status(400).json({ message: "ID do usuário não informado" });
    }
    
    // Atualiza a imagem do usuário na tabela usuario
    const resultado = await sql`
      UPDATE usuario 
      SET imagens = ${image} 
      WHERE id_usuario = ${id_usuario} returning *
    `;
    
    if (resultado.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    
    return res.status(201).json({ message: "Imagem cadastrada com sucesso!" });
    
  } catch (error) {
    console.error("Erro ao cadastrar imagem:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
});

//pra buscar de um especifico
app.get("/imagem/:id_usuario", async (req, res) => {
  try {
    const { id_usuario } = req.params;
    
    const resultado = await sql`
      SELECT imagens FROM usuario 
      WHERE id_usuario = ${id_usuario}
    `;
    
    if (resultado.length === 0 || !resultado[0].imagens) {
      return res.status(404).json({ message: "Imagem não encontrada" });
    }
    
    return res.status(200).json({ imagem: resultado[0].imagens });
    
  } catch (error) {
    console.error("Erro ao buscar imagem:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
});

app.listen(3000, () => {
  console.log("Cu");
});


