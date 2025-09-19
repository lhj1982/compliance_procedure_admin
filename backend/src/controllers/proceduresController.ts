import { Request, Response } from 'express';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'compliance_admin',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

export const getProcedures = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT tcp.*, t.name as team_name
      FROM teams_compliance_procedures tcp
      JOIN teams t ON tcp.team_id = t.id
      ORDER BY tcp.updated_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching procedures:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createProcedure = async (req: Request, res: Response) => {
  try {
    const { team_id, file_path, status } = req.body;

    if (!team_id || !file_path) {
      return res.status(400).json({ error: 'Team ID and file path are required' });
    }

    const result = await pool.query(
      'INSERT INTO teams_compliance_procedures (team_id, file_path, status, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *',
      [team_id, file_path, status || 'draft']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating procedure:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProcedure = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { team_id, file_path, status } = req.body;

    const result = await pool.query(
      'UPDATE teams_compliance_procedures SET team_id = $1, file_path = $2, status = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [team_id, file_path, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Procedure not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating procedure:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};