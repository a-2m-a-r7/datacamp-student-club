const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const htmlPath = path.resolve(__dirname, 'PROJECT_ADDITIONS_REPORT.html');
const pdfPath = path.resolve(__dirname, 'PROJECT_ADDITIONS_REPORT.pdf');

console.log('HTML path:', htmlPath);
console.log('PDF output path:', pdfPath);

const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');

const args = [
  '--headless',
  '--disable-gpu',
  '--run-all-compositor-stages-before-draw',
  '--no-pdf-header-footer',
  `--print-to-pdf=${pdfPath}`,
  fileUrl
];

execFile(edgePath, args, (error, stdout, stderr) => {
  if (error) {
    console.error('Edge execution error:', error);
    process.exit(1);
  }
  console.log('Edge output:', stdout);
  if (fs.existsSync(pdfPath)) {
    const stats = fs.statSync(pdfPath);
    console.log(`SUCCESS: PDF generated successfully! Size: ${stats.size} bytes`);
  } else {
    console.error('ERROR: PDF was not found.');
    process.exit(1);
  }
});
