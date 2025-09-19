import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

const DOCUMENTS_PATH = path.join(__dirname, '../../generated_docs');

export const getDocument = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;

    if (!teamId) {
      return res.status(400).json({ error: 'Team ID is required' });
    }

    const fileName = `${teamId}_procedure_document.docx`;
    const filePath = path.join(DOCUMENTS_PATH, fileName);

    console.log(`Looking for document at: ${filePath}`);
    console.log(`Documents directory exists: ${fs.existsSync(DOCUMENTS_PATH)}`);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`Document not found: ${filePath}`);
      return res.status(404).json({ error: `Document not found: ${fileName}` });
    }

    const stats = fs.statSync(filePath);
    console.log(`File found, size: ${stats.size} bytes`);

    // Set appropriate headers for download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', stats.size.toString());
    res.setHeader('Cache-Control', 'no-cache');

    // Stream the file
    const fileStream = fs.createReadStream(filePath);

    fileStream.on('error', (err) => {
      console.error('File stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error reading file' });
      }
    });

    fileStream.pipe(res);

  } catch (error) {
    console.error('Error serving document:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const getDocumentInfo = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;

    if (!teamId) {
      return res.status(400).json({ error: 'Team ID is required' });
    }

    const fileName = `${teamId}_procedure_document.docx`;
    const filePath = path.join(DOCUMENTS_PATH, fileName);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.json({
        fileName,
        exists: false,
        downloadUrl: `/api/documents/${teamId}/download`
      });
    }

    // Get file stats
    const stats = fs.statSync(filePath);

    res.json({
      fileName,
      exists: true,
      size: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
      downloadUrl: `/api/documents/${teamId}/download`
    });

  } catch (error) {
    console.error('Error getting document info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};