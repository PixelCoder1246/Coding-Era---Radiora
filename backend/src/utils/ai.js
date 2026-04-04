const axios = require('axios');

function isAiEnabled() {
  const url = process.env.AI_BASE_URL;
  return !!url && url.trim().length > 0;
}

function triggerAiAnalysis(caseId, studyInstanceUID, orthancUrl) {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
  const callbackUrl = `${backendUrl}/api/cases/${caseId}/ai-result`;

  axios
    .post(`${process.env.AI_BASE_URL}/analyze`, {
      caseId,
      studyInstanceUID,
      orthancUrl,
      callbackUrl,
    })
    .catch((err) => {
      console.error(
        `[AI] Failed to trigger analysis for case ${caseId}:`,
        err.message
      );
    });
}

module.exports = { isAiEnabled, triggerAiAnalysis };
