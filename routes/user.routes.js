const express = require("express");
const router = express.Router();
const {pool} = require('../config/db.config');
const calculateDistance  = require('../function/calculateDistance.function');

const { body, validationResult } = require('express-validator');

// POST /addSchool - Add a new school
router.post('/addSchool', [
  body('name').notEmpty().withMessage('Name is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, address, latitude, longitude } = req.body;

  try {
    const [result] = await pool.query(
      'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
      [name, address, latitude, longitude]
    );
    res.status(201).json({ message: 'School added successfully', schoolId: result.insertId });
  } catch (error) {
    console.error('Error adding school:', error);
    res.status(500).json({ error: 'Failed to add school' });
  }
});

// GET /listSchools - List schools sorted by proximity
router.get('/listSchools', [
  body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
  body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userLat = parseFloat(req.query.latitude) || 0;
  const userLon = parseFloat(req.query.longitude) || 0;

  try {
    const [schools] = await pool.query('SELECT * FROM schools');
    const sortedSchools = schools.map(school => ({
      ...school,
      distance: calculateDistance(userLat, userLon, school.latitude, school.longitude)
    })).sort((a, b) => a.distance - b.distance);

    res.json(sortedSchools);
  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({ error: 'Failed to fetch schools' });
  }
});


module.exports = router;