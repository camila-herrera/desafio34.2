const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'password',
  database: 'softjobs',
  allowExitOnIdle: true,
});

const verificarToken = (req, res, next) => {
  try {
    const Authorization = req.header('Authorization');
    if (!Authorization) throw { code: 401, message: 'No token provided' };
    
    const token = Authorization.split('Bearer ')[1];
    if (!token) throw { code: 401, message: 'No token provided' };
    
    const decoded = jwt.verify(token, 'az_AZ');
    req.user = decoded; 
    next();
  } catch (error) {
    console.error("Error al verificar el token:", error);  // Agregado para depuración
    res.status(error.code || 500).send(error.message || 'Internal Server Error');
  }
};

const verificarCredenciales = async (email, password) => {
  const consulta = "SELECT * FROM usuarios WHERE email = $1";
  const values = [email];
  const { rows } = await pool.query(consulta, values);
  console.log("Resultado de la consulta:", rows);  // Agregado para depuración
  if (!rows.length) {
    console.error(`No se encontró el usuario con el email: ${email}`);
    throw { code: 404, message: "No se encontró ningún usuario con este email" };
  }

  const usuario = rows[0];
  const passwordMatch = await bcrypt.compare(password, usuario.password);
  if (!passwordMatch) {
    console.error(`Las credenciales para el usuario ${email} no coinciden`);
    throw { code: 401, message: "Credenciales incorrectas" };
  }

  return usuario;
};

  
const registrarUsuario = async (email, password, rol, lenguage) => {
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      const consulta = "INSERT INTO usuarios (email, password, rol, lenguage) VALUES ($1, $2, $3, $4) RETURNING id";
      const values = [email, passwordHash, rol, lenguage]; // Usamos 'language' en lugar de 'lenguage'
      const { rows } = await pool.query(consulta, values);
      console.log(`Nuevo usuario registrado con ID: ${rows[0].id}`);
      return rows[0].id;
    } catch (error) {
      console.error('Error al registrar el usuario:', error);
      throw { code: 500, message: 'Error al registrar el usuario' };
    }
};

const obtenerUsuario = async (email) => {
  const consulta = "SELECT email, rol, lenguage FROM usuarios WHERE email = $1";
  const values = [email];
  const { rows } = await pool.query(consulta, values);
  if (!rows.length) {
    throw { code: 404, message: "Usuario no encontrado" };
  }
  return rows[0];
};

const actualizarEvento = async (titulo, descripcion, fecha, lugar, id) => {
  const consulta = "UPDATE eventos SET titulo=$1, descripcion=$2, fecha=$3, lugar=$4 WHERE id = $5";
  const values = [titulo, descripcion, fecha, lugar, id];
  const { rowCount } = await pool.query(consulta, values);
  if (!rowCount) throw { code: 404, message: "No se encontró ningún evento con este ID" };
};

module.exports = {  verificarCredenciales,  verificarToken,  actualizarEvento,  registrarUsuario, obtenerUsuario};
