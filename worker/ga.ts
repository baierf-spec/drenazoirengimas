// Užklausų skaičiavimas GA4 iš serverio (Measurement Protocol). Siunčiama tik po to,
// kai laiškas priimtas – GA mato visas užklausas net su reklamų blokavimu ar be slapukų.
// Į Google nesiunčiami jokie asmens duomenys. Reikia Secret `GA_API_SECRET`.
export async function sendServerLead(opts: {
  measurementId: string;
  apiSecret: string | undefined;
  request: Request;
  params?: Record<string, string | number>;
}): Promise<boolean> {
  if (!opts.measurementId || !opts.apiSecret) return false;
  const headerCid = opts.request.headers.get("x-ga-client-id") ?? "";
  const headerSid = opts.request.headers.get("x-ga-session-id") ?? "";
  const clientId = /^\d+\.\d+$/.test(headerCid)
    ? headerCid
    : `${Math.floor(Math.random() * 2147483647)}.${Math.floor(Date.now() / 1000)}`;
  const sessionId = /^\d{6,20}$/.test(headerSid) ? headerSid : "";
  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(opts.measurementId)}&api_secret=${encodeURIComponent(opts.apiSecret)}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        events: [
          {
            name: "generate_lead",
            params: {
              form_name: "kontaktinė_forma",
              lead_type: "užklausa",
              engagement_time_msec: 1,
              tracking: headerCid ? "server_cookie" : "server_no_cookie",
              ...(sessionId && { session_id: sessionId }),
              ...opts.params,
            },
          },
        ],
      }),
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch (error) {
    console.error("GA Measurement Protocol error", error);
    return false;
  }
}
