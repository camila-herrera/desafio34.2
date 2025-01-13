const express = require('express');
const app = express();
const cors = require('cors');
const { verificarCredenciales, verificarToken, actualizarEvento, registrarUsuario } = require('./consulta');
const jwt = require('jsonwebtoken'); 

app.listen(3000, console.log("SERVER ON"));
app.use(cors());
app.use(express.json());

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await verificarCredenciales(email, password);
    const token = jwt.sign({ email: usuario.email, id: usuario.id }, "az_AZ", { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error("Error en /login:", error);
    res.status(error.code || 500).send(error.message || 'Internal Server Error');
  }
});

app.post("/register", async (req, res) => {
  try {
    const { email, password, rol, lenguage } = req.body;
    const userId = await registrarUsuario(email, password, rol, lenguage);
    res.status(201).send(`Usuario registrado con ID: ${userId}`);
  } catch (error) {
    res.status(error.code || 500).send(error.message || 'Internal Server Error');
  }
});

app.get("/usuarios", verificarToken, async (req, res) => {
  try {
    const { email } = req.user;
    const usuario = await obtenerUsuario(email);
    res.json(usuario);
  } catch (error) {
    res.status(error.code || 500).send(error.message || 'Internal Server Error');
  }
});
