import fs from 'fs';
import path from 'path';
import { PDFParse } from 'pdf-parse';

const RAW_DIR = path.join(process.cwd(), 'src/lib/knowledge/raw');
const OUTPUT_FILE = path.join(process.cwd(), 'src/lib/knowledge/index.json');

interface KnowledgeItem {
  filename: string;
  content: string;
  lastUpdated: string;
}

async function processPDFs() {
  console.log('🚀 Starting PDF processing...');

  if (!fs.existsSync(RAW_DIR)) {
    console.error(`❌ Raw directory not found: ${RAW_DIR}`);
    return;
  }

  const files = fs.readdirSync(RAW_DIR).filter(file => file.toLowerCase().endsWith('.pdf'));
  
  if (files.length === 0) {
    console.warn('⚠️ No PDF files found in src/lib/knowledge/raw');
    return;
  }

  const knowledge: KnowledgeItem[] = [];

  for (const file of files) {
    console.log(`📄 Processing: ${file}`);
    const filePath = path.join(RAW_DIR, file);
    const dataBuffer = fs.readFileSync(filePath);

    try {
      // Use the v2 class-based API
      const parser = new PDFParse({ data: dataBuffer });
      const data = await parser.getText();
      const info = await parser.getInfo();
      await parser.destroy();
      
      // Clean up text: remove multiple spaces, empty lines, etc.
      const cleanedText = data.text
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, '\n')
        .trim();

      knowledge.push({
        filename: file,
        content: cleanedText,
        lastUpdated: new Date().toISOString()
      });
      
      console.log(`✅ Successfully processed ${file} (${info.total} pages)`);
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error);
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(knowledge, null, 2));
  console.log(`\n✨ Knowledge index updated: ${OUTPUT_FILE}`);
  console.log(`📊 Total documents indexed: ${knowledge.length}`);
}

processPDFs();
