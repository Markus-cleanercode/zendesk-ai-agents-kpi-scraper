import { google } from "googleapis";

// 1. CONFIGURATION
const SPREADSHEET_ID = "1Me4RqtMvlnovO-l8EGlMWU7SzR2eCd9_loJYJZaQkHI";
const KEY_FILE_PATH = "credentials.json"; // Your downloaded JSON key

async function writeBatch() {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: KEY_FILE_PATH,
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        const client = await auth.getClient();
        const googleSheets = google.sheets({ version: "v4", auth: client });

        // CONSTRUCT THE BATCH REQUEST
        const request = {
            spreadsheetId: SPREADSHEET_ID,
            resource: {
                valueInputOption: "USER_ENTERED", // Defined once for the whole batch
                data: [
                    {
                        range: "Usecases!A1",
                        values: [["Hello"]],
                    },
                    {
                        range: "Usecases!C5", // Different cell, or even different Sheet/Tab
                        values: [["World"]],
                    },
                ],
            },
        };

        // NOTE: Method is now 'values.batchUpdate'
        const response = await googleSheets.spreadsheets.values.batchUpdate(
            request,
        );

        console.log(
            `Success! Total cells updated: ${response.data.totalUpdatedCells}`,
        );
    } catch (error) {
        console.error("Error executing batch update:", error.message);
    }
}

writeBatch();
