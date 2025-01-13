const express = require('express');
const app = express();
const cors = require('cors');
const { verificarCredenciales, verificarToken, actualizarEvento, registrarUsuario } = require('./consulta');
const jwt = require('jsonwebtoken');  // Asegúrate de importar jsonwebtoken aquí

app.listen(3000, console.log("SERVER ON"));
app.use(cors());
app.use(express.json());

// Ruta para el login de usuarios
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await verificarCredenciales(email, password);
    // Generación del token con jsonwebtoken
    const token = jwt.sign({ email: usuario.email, id: usuario.id }, "az_AZ", { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error("Error en /login:", error);
    res.status(error.code || 500).send(error.message || 'Internal Server Error');
  }
});

// Ruta para registrar un nuevo usuario
app.post("/register", async (req, res) => {
  try {
    const { email, password, rol, lenguage } = req.body;
    const userId = await registrarUsuario(email, password, rol, lenguage);
    res.status(201).send(`Usuario registrado con ID: ${userId}`);
  } catch (error) {
    res.status(error.code || 500).send(error.message || 'Internal Server Error');
  }
});



// Ruta para obtener los datos del usuario autenticado
app.get("/usuarios", verificarToken, async (req, res) => {
  try {
    const { email } = req.user;
    const usuario = await obtenerUsuario(email);
    res.json(usuario);
  } catch (error) {
    res.status(error.code || 500).send(error.message || 'Internal Server Error');
  }
});
