const fs = require('fs');
const dcmjs = require('dcmjs');

async function modifyDicomAccession(
  filePath,
  destinationPath,
  accessionNumber
) {
  try {
    const arrayBuffer = fs.readFileSync(filePath).buffer;
    const dicomDict = dcmjs.data.DicomMessage.readFile(arrayBuffer);

    const tag = '00080050';

    if (dicomDict.dict[tag]) {
      dicomDict.dict[tag].Value = [accessionNumber];
    } else {
      // If tag is missing, we add it.
      // Note: VR (Value Representation) for Accession Number is SH (Short String)
      dicomDict.dict[tag] = {
        vr: 'SH',
        Value: [accessionNumber],
      };
    }

    const outputBuffer = Buffer.from(dicomDict.write());
    fs.writeFileSync(destinationPath, outputBuffer);

    return true;
  } catch (error) {
    console.error('[DICOM_UTILS] Error modifying DICOM:', error);
    throw error;
  }
}

module.exports = {
  modifyDicomAccession,
};
