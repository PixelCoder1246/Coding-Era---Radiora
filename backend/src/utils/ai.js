const axios = require('axios');

function isAiEnabled() {
  const url = process.env.AI_BASE_URL;
  return !!url && url.trim().length > 0;
}

function triggerAiAnalysis(
  caseId,
  studyInstanceUID,
  orthancUrl,
  orthancUsername,
  orthancPassword
) {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
  const callbackUrl = `${backendUrl}api/cases/${caseId}/ai-result`;

  const payload = {
    caseId,
    studyInstanceUID,
    orthancUrl,
    orthancUsername,
    orthancPassword,
    callbackUrl,
  };

  console.log(`[AI] Firing POST Request to ${process.env.AI_BASE_URL}/analyze`);
  console.log(`[AI] Payload being sent:`, JSON.stringify(payload, null, 2));

  axios
    .post(`${process.env.AI_BASE_URL}/analyze`, payload)
    .then((res) => {
      console.log(
        `[AI] Successfully sent POST to AI server. Status:`,
        res.status
      );
    })
    .catch((err) => {
      console.error(
        `[AI] ERROR: Failed to trigger analysis for case ${caseId}:`,
        err.message
      );
      if (err.response) {
        console.error(`[AI] Response data:`, err.response.data);
      }
    });
}

module.exports = { isAiEnabled, triggerAiAnalysis };
