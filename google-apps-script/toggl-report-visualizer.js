/** 参考
    * https://qiita.com/yokozawa0701/items/e4c392bd0afe9902e51d
    * https://qiita.com/e99h2121/items/18533f39dc3643c1ceaf
 */
function togglReportVisualizer() {
    const togglAccountInfoArray = getTogglAccountInfo();
    const togglReportArray = makeTogglReportArray(togglAccountInfoArray);
    postTogglReportVisualizationSheet(togglReportArray);

    //GSS のレコードを横棒グラフに整形
        //レコードを一つずつ読み込む
        //タイトルが同じレコードの時刻を合算
        //時刻を適当に丸める
        //グラフ表示用シートへ転記
        //次のタイトルへ
}

function getTogglAccountInfo() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("TogglAccountInfo");
    const lastRow = sheet.getLastRow();
    const targetRange = sheet.getRange(2, 1, 3, lastRow);

    return targetRange.getValues();
}

function makeTogglReportArray(togglAccountInfoArray) {
    const togglReportArray = [];

    for (togglAccountInfo of togglAccountInfoArray) {

        const api_token = togglAccountInfo[0];
        const workspace_id = togglAccountInfo[1];
        const user_agent = togglAccountInfo[2];

        // const timeEntries = getTogglTimeEntries();
        // for (const timeEntry of timeEntries) {

        //     const projectName = "pid" in timeEntry ? getProject(timeEntry.pid) : "No Project";
        //     const entryStart = timeEntry.start;
        //     const description = timeEntry.description;

        //     togglReportArray.push[projectName,entryStart,description];
        // }

        const summaryArray = getTogglSummary(api_token, workspace_id, user_agent);

        //for...of で記載すれば十分
        for (let i = 0; i < summaryArray.data.length; i++) {

            const project = summaryArray.data[i].title.project;
            const items = summaryArray.data[i].items;

            for (const item of items) {

                const title = item.title.time_entry;
                const local_start = item.local_start;

                const start_date = local_start.substr(0,10).replace(/-/g,"/");
                const start_time = local_start.substr(11); //String

                const start_dateTime = new Date(start_date + " " + start_time);
                const time = item.time; //millionsecond

                const end_dateTime = new Date(start_dateTime.getTime() + time);

                togglReportArray.push([user_agent, project, title, formatDate(start_dateTime), formatDate(end_dateTime)]);
            }
        }
    }

    return togglReportArray; //日付の昇順でソートしたい
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

function getTogglSummary(api_token, workspace_id, user_agent) {
    const BASIC_AUTH = api_token + ":api_token";
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

function formatDate(date) {
    return Utilities.formatDate(date, "JST", "yyy/MM/dd HH:mm:ss")
}

function postTogglReportVisualizationSheet(array) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("TogglReport");
    const lastRow = sheet.getLastRow();
    const targetRange = sheet.getRange(lastRow + 1, 1, array.length, array[0].length);

    return targetRange.setValues(array);
}