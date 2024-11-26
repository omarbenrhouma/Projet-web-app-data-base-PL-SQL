require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

// Initialisation de l'application
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configuration de la base de données
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Routes CRUD

// ============================================
// Chercheurs : CRUD
// ============================================

// Lire tous les chercheurs
app.get('/chercheurs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM chercheur');
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des chercheurs:', err);
    res.status(500).send('Erreur serveur');
  }
});

// Lire un chercheur par ID
app.get('/chercheurs', async (req, res) => {
    const { search } = req.query;
  
    try {
      const query = search
        ? `SELECT * FROM chercheur WHERE chnom ILIKE $1 OR email ILIKE $1`
        : `SELECT * FROM chercheur`;
  
      const values = search ? [`%${search}%`] : [];
  
      const result = await pool.query(query, values);
      res.json(result.rows);
    } catch (error) {
      console.error('Erreur lors de la récupération des chercheurs :', error.message);
      res.status(500).send('Erreur serveur');
    }
  });
  

// Ajouter un nouveau chercheur
app.post('/chercheurs', async (req, res) => {
    const { chnom, grade, statut, daterecrut, salaire, prime, email, supno, labno, facno } = req.body;
  
    if (!daterecrut) {
      return res.status(400).send({ message: 'La date de recrutement est obligatoire' });
    }
  
    try {
      const result = await pool.query(
        `INSERT INTO chercheur (chnom, grade, statut, daterecrut, salaire, prime, email, supno, labno, facno)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [chnom, grade, statut, daterecrut, salaire, prime, email, supno, labno, facno]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du chercheur :', error.message);
      res.status(500).send('Erreur serveur');
    }
  });
  

// Modifier un chercheur
// Route pour mettre à jour un chercheur
app.put('/chercheurs/:id', async (req, res) => {
    const { id } = req.params;
    const { chnom, grade, statut, daterecrut, salaire, prime, email, supno, labno, facno } = req.body;
  
    try {
      const result = await pool.query(
        `UPDATE chercheur
         SET chnom = $1, grade = $2, statut = $3, daterecrut = $4, salaire = $5, prime = $6,
             email = $7, supno = $8, labno = $9, facno = $10
         WHERE chno = $11 RETURNING *`,
        [chnom, grade, statut, daterecrut, salaire, prime, email, supno, labno, facno, id]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).send('Chercheur non trouvé');
      }
  
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Erreur lors de la mise à jour du chercheur :', err.message);
      res.status(500).send('Erreur serveur');
    }
  });
  
// Route pour récupérer un chercheur par ID
app.get('/chercheurs/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query('SELECT * FROM chercheur WHERE chno = $1', [id]);
      if (result.rows.length === 0) {
        return res.status(404).send('Chercheur non trouvé');
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erreur lors de la récupération du chercheur :', error.message);
      res.status(500).send('Erreur serveur');
    }
  });
    

// Supprimer un chercheur
app.delete('/chercheurs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM chercheur WHERE chno = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).send('Chercheur non trouvé');
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur lors de la suppression:', err);
    res.status(500).send('Erreur serveur');
  }
});

// ============================================
// Facultés : CRUD
// ============================================

app.get('/facultes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM faculte');
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des facultés:', err);
    res.status(500).send('Erreur serveur');
  }
});

app.post('/facultes', async (req, res) => {
  const { facnom, adresse, libelle } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO faculte (facnom, adresse, libelle) VALUES ($1, $2, $3) RETURNING *',
      [facnom, adresse, libelle]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur lors de l\'ajout de faculté:', err);
    res.status(500).send('Erreur serveur');
  }
});

app.put('/facultes/:id', async (req, res) => {
  const { id } = req.params;
  const { facnom, adresse, libelle } = req.body;
  try {
    const result = await pool.query(
      'UPDATE faculte SET facnom = $1, adresse = $2, libelle = $3 WHERE facno = $4 RETURNING *',
      [facnom, adresse, libelle, id]
    );
    if (result.rows.length === 0) return res.status(404).send('Faculté non trouvée');
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur lors de la mise à jour de la faculté:', err);
    res.status(500).send('Erreur serveur');
  }
});

app.delete('/facultes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM faculte WHERE facno = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).send('Faculté non trouvée');
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur lors de la suppression de la faculté:', err);
    res.status(500).send('Erreur serveur');
  }
});

// ============================================
// Publications : CRUD
// ============================================

app.get('/publications', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM publication');
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des publications:', err);
    res.status(500).send('Erreur serveur');
  }
});

app.post('/publications', async (req, res) => {
  const { titre, theme, type, volume, date, apparition, editeur } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO publication (titre, theme, type, volume, date, apparition, editeur) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [titre, theme, type, volume, date, apparition, editeur]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur lors de l\'ajout de publication:', err);
    res.status(500).send('Erreur serveur');
  }
});

// ============================================
// Relations spécifiques
// ============================================

// Bibliographie : Publications d'un auteur spécifique
app.get('/chercheurs/:id/publications', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT pub.* 
       FROM publier p
       JOIN publication pub ON p.pubno = pub.pubno
       WHERE p.chno = $1`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des publications:', err);
    res.status(500).send('Erreur serveur');
  }
});

// Hiérarchie des chercheurs dans un laboratoire
// Lire tous les laboratoires
app.get('/laboratoires', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM laboratoire');
      res.json(result.rows);
    } catch (err) {
      console.error('Erreur lors de la récupération des laboratoires:', err.message);
      res.status(500).send('Erreur serveur');
    }
  });

  // Route pour récupérer les publications d'un chercheur spécifique
app.get('/chercheurs/:id/publications', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        `SELECT pub.pubno, pub.titre, pub.theme, pub.type, pub.volume, pub.date, pub.apparition, pub.editeur
         FROM publier p
         JOIN publication pub ON p.pubno = pub.pubno
         WHERE p.chno = $1`,
        [id]
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Erreur lors de la récupération des publications :', err.message);
      res.status(500).send('Erreur serveur');
    }
  });

  
  // Route pour récupérer la hiérarchie des chercheurs dans un laboratoire
app.get('/laboratoires/:id/hierarchie', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        `WITH RECURSIVE hierarchie AS (
           SELECT ch.chno, ch.chnom, ch.grade, ch.supno, ch.labno
           FROM chercheur ch
           WHERE ch.labno = $1 AND ch.supno IS NULL
           UNION ALL
           SELECT ch.chno, ch.chnom, ch.grade, ch.supno, ch.labno
           FROM chercheur ch
           INNER JOIN hierarchie h ON ch.supno = h.chno
         )
         SELECT * FROM hierarchie`,
        [id]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Erreur lors de la récupération de la hiérarchie :', error.message);
      res.status(500).send('Erreur serveur');
    }
  });

  //
  app.get('/search/chercheur', async (req, res) => {
    const { column, value } = req.query;

    // Sécurisez la colonne pour éviter l'injection SQL
    const validColumns = ['chnom', 'grade', 'statut', 'email'];
    if (!validColumns.includes(column)) {
        return res.status(400).send('Colonne invalide');
    }

    try {
        const query = `SELECT * FROM chercheur WHERE ${column} ILIKE $1`;
        const result = await pool.query(query, [`%${value}%`]);
        res.json(result.rows);
    } catch (error) {
        console.error('Erreur lors de la recherche :', error.message);
        res.status(500).send('Erreur serveur');
    }
});

  

// ============================================
// Lancer le serveur
// ============================================

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
