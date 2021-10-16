/** 参考
    * https://qiita.com/yokozawa0701/items/e4c392bd0afe9902e51d
    * https://qiita.com/e99h2121/items/18533f39dc3643c1ceaf
 */
function togglReportVisualizer() {
    //Toggl の当日のレポートを取得
    //GSS へ転記

    //GSS のレコードを横棒グラフに整形
        //レコードを一つずつ読み込む
        //タイトルが同じレコードの時刻を合算
        //時刻を適当に丸める
        //グラフ表示用シートへ転記
        //次のタイトルへ
}

var Toggl = {
    BASIC_AUTH: '【ご自身のAPIキー】:api_token',
  
    get: function(path){
        var url = 'https://www.toggl.com/api/v8' + path;
        var options = {
          'method' : 'GET',
          'headers': {"Authorization" : "Basic " + Utilities.base64Encode(this.BASIC_AUTH)}
        }
        var response = UrlFetchApp.fetch(url, options);
        return JSON.parse(response);
    },
    getTimeEntries: function(){
        var path = '/time_entries'
        return this.get(path)
    },
    getTimeEntry: function(id) {
        var path = '/time_entries/' + id
        return this.get(path);
    },
    getProject: function(id) {
        var path = '/projects/' + id
        return this.get(path);
    }
}
  
var Slack = {  
    post: function(message){
        var url = '【ご自身で作ったAPIのURL】';
        var options = {
          'method': 'POST',
          'contentType': 'application/json',
          'payload': JSON.stringify({'text': message})
        }
        var response = UrlFetchApp.fetch(url, options);
        return response;
    },
}
  
function main() {
    var togglLogSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("TogglLog");
    var timeEntries = Toggl.getTimeEntries();
    var lastTimeEntryId = togglLogSheet.getRange(1,1).getValue();
  
    for(var i in timeEntries) {
        var timeEntry = timeEntries[i];
  
        if(timeEntry.id <= lastTimeEntryId) {
            continue;
        }
        if(timeEntry.duration < 0) {
            continue;
        }
    
        lastTimeEntryId = timeEntry.id
        var projectName = Toggl.getProject(timeEntry.pid).data.name
        var data = []
        togglLogSheet.getRange(togglLogSheet.getLastRow() + 1, 1, 1, togglLogSheet.getLastColumn())
            .setValues([[timeEntry.id, projectName, timeEntry.description, timeEntry.duration, new Date(timeEntry.start), new Date(timeEntry.stop)]]);
        Slack.post(formatText(projectName, timeEntry))
    }
    togglLogSheet.getRange(1,1).setValue(lastTimeEntryId);
}
  
function formatText(projectName, timeEntry) {
    return '【' + projectName + '】 *' + timeEntry.description + '* ：' + Math.round(timeEntry.duration/60/60*100)/100 + '時間'
}