/** 参考
    * https://qiita.com/yokozawa0701/items/e4c392bd0afe9902e51d
    * https://qiita.com/e99h2121/items/18533f39dc3643c1ceaf
 */
function togglReportVisualizer() {
    const togglReportArray = makeTogglReportArray();
    // postTogglReportVisualizationSheet(togglReportArray);

    //GSS のレコードを横棒グラフに整形
        //レコードを一つずつ読み込む
        //タイトルが同じレコードの時刻を合算
        //時刻を適当に丸める
        //グラフ表示用シートへ転記
        //次のタイトルへ
}

function makeTogglReportArray() {
    const togglReportArray = [];

    // const timeEntries = getTogglTimeEntries();
    // for (const timeEntry of timeEntries) {

    //     const projectName = "pid" in timeEntry ? getProject(timeEntry.pid) : "No Project";
    //     const entryStart = timeEntry.start;
    //     const description = timeEntry.description;

    //     togglReportArray.push[projectName,entryStart,description];
    // }

    const summuryArray = getTogglSummury();

    console.log(summuryArray.data[0].title.project); //Project
    console.log(summuryArray.data[0].items[1].title.time_entry); //Title

    // for (summry of summuryArray) {
    //     console.log(summry);
    // }

    // return togglReportArray;
}

function getTogglTimeEntries() {
    return get("/time_entries")
}

function getProject(id) {
    return this.get("/projects/" + id);
}

function get(path) {
    const BASIC_AUTH = getTogglApiToken() + ":api_token";

    const url = "https://api.track.toggl.com/api/v8" + path;
    const options = {
        "method" : "GET",
        "headers": {"Authorization" : "Basic " + Utilities.base64Encode(BASIC_AUTH)},
        // "muteHttpExceptions" : true,
        "validateHttpsCertificates" : false,
        "followRedirects" : false
    }

    let response;
    try {
        response = UrlFetchApp.fetch(url, options);
        console.log(response.getContentText());
    } catch(e) {
        // 例外エラー処理
        console.log('Error:')
        console.log(e)
    }

    return JSON.parse(response);
}

function getTogglSummury() {
    const BASIC_AUTH = getTogglApiToken() + ":api_token";
    const workspace_id = getWorkspaceId();
    const user_agent = getUserAgent();

    const url = "https://api.track.toggl.com/reports/api/v2/summary" 
        + "?workspace_id=" + workspace_id 
        + "&since=2021-10-10&until=2021-10-15&user_agent=" + user_agent;
    const options = {
        "method" : "GET",
        "headers": {"Authorization" : "Basic " + Utilities.base64Encode(BASIC_AUTH)},
        "muteHttpExceptions" : true,
        "validateHttpsCertificates" : false,
        "followRedirects" : false
    }

    let response;
    try {
        response = UrlFetchApp.fetch(url, options);
        console.log(response.getContentText());
    } catch(e) {
        // 例外エラー処理
        console.log("Error: "+ e);
    }

    return JSON.parse(response);
}

function postTogglReportVisualizationSheet(array) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("TogglReport");
    const lastRow = sheet.getLastRow();
    console.log(array[0]);
    console.log(array[0].length);
    // const targetRange = sheet.getRange(lastRow + 1, 1, array[0].length(), array.length());

    // return targetRange.setValues(array);
}