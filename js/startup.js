
// entry point
function StartPanorama() {

	console.time('startup');

	setPageFormat();
		
	console.timeEnd('startup');
};

// Using parameters in page var to set up the webpage format
function setPageFormat(){
		
		// Put image and choice side-by-side
		$('#main_canvas').append("<div id = 'loading'> Searching live streams...</div>" +
								 "<div id = 'video_region'> </div>" +
								 "<br> </br> "  
								);
			
		$('#main_canvas').width('100%');
		document.getElementById('loading').style.visibility = 'hidden';

};


function getVideoURL(video_name, start_time, end_time) {
        return server_url + '/panorama-engine/videos/' + video_name + '.mp4#t=' + start_time
}

function showVideos(metadata, opt_text_vis, opt_text) {

	var html_str = '<table style = "width:100%">';
    html_str += '<tr><td><font size = 5><b> Metadata </b></font></td><td> <font size=5><b>CNN Tags + Visual Hint</b></font></td> <td> <font size = 5> <b> CNN Tags</b> </font></td></b> </font></tr>'; 
    for (i = 0; i < topk; ++i){
        metadata_video = metadata[i];
        opt_text_vis_video = opt_text_vis[i];
        opt_text_video = opt_text[i];

        html_str += '<tr>'
                    +' <td> <video width = "420" controls muted> <source src ="' + getVideoURL(metadata_video['video_name'], metadata_video['start_time'], metadata_video['end_time']) + '" type="video/mp4">' 
					+  'Your browser does not support HTML5 video.'
					+  '</video> </td>'

                    +' <td> <video width = "420" controls muted> <source src ="' + getVideoURL(opt_text_vis_video['video_name'], opt_text_vis_video['start_time'], opt_text_vis_video['end_time']) + '" type="video/mp4">' 
					+  'Your browser does not support HTML5 video.'
					+  '</video> </td>'
 
                    +' <td> <video width = "420" controls muted> <source src ="' + getVideoURL(opt_text_video['video_name'], opt_text_video['start_time'], opt_text_video['end_time']) + '" type="video/mp4">' 
					+  'Your browser does not support HTML5 video.'
					+  '</video> </td>'

                    + ' </tr>';
    }    
    html_str +=  '</table>'
    
	$('#video_region').html(html_str);
}


function processResponse(responseText){
    console.log(responseText);
    var response_obj = JSON.parse(responseText); 
    metadata = response_obj['response']['metadata'];
    opt_text = response_obj['response']['opt_text'];
    opt_text_vis = response_obj['response']['opt_text_vis'];
    showVideos(metadata, opt_text_vis, opt_text); 
}


function doSearch(){

    query_str = document.getElementById('searchbox').value;
	 $('#loading').html('Searching live streams...');
    
    if (window.XMLHttpRequest) {
        var xml_http = new XMLHttpRequest();
        xml_http.onreadystatechange = function (){

            if (xml_http.readyState == 4 && xml_http.status == 200) {
                
                processResponse(xml_http.responseText);
    	        document.getElementById('loading').style.visibility = 'hidden';
            } else if (xml_http.readyState == 4 && xml_http.status == 500){
				  $('#loading').html('Visual search does not support "' + query_str + '". Try query starting with "person, dog, cat, car". How about "person ' + query_str + '"?');
				}

        };
        xml_http.open("GET", server_url + ':5000/search?query=' + query_str, true);
        xml_http.setRequestHeader("Access-Control-Allow-Origin", '*');
        xml_http.send('');
	    document.getElementById('loading').style.visibility = 'visible';
        
    } 
       
 
} 

function renderButtons(){

	var intro_str = '<br><table>'
			+ '<tr><td>'
			+ '<font size="4"><b> When searching videos using keyword: </font> <font size = 7> <u>"dog"</u></font> <font size = "4">, which video is more relevant? </b></font>'         
		   + '</tr></td>' 
			+ '</table>';
	$('#choice').append(intro_str);
	var select_html_str = '<form>' +
								' <input type="radio" name="score" value="A" onchange="onChange()"> Video A <br>' +
								' <input type="radio" name="score" value="B" onchange="onChange()"> Video B <br>' +
								' </form>';
	$('#choice').append(select_html_str);

	var html_submit_str = ''
	html_submit_str = '<table style = "width: 100%">'
					+ '<tr>'
					+ '<td>'
					+ '<button disabled="true" type="button" style="height:50px; width:100%" id="mt_submit" name="Submit" onclick="onSubmit(this);">Submit HIT </button>'
       			+ '</td>'
					+ '<td>'
      	 	   + '<form id="amt-form" action="' + submitURL + '">'
					+ '<input type="hidden" id="assignmentId" name="assignmentId" value="'+ page.assignmentId +'" />'
					+ '<input type="hidden" id="turkSubmitTo" name="turkSubmitTo" value="'+ page.turkSubmitTo +'" />'
					+ '<input type="hidden" id="hitId" name="hitId" value="'+ page.hitId +'" />'
					+ '<input type="hidden" id="workerId" name="workerId" value="'+ page.workerId +'" />'
					+ '<input type="hidden" id="video_name_a" name="video_name_a" value="' + page.video_name_a + '" />'
					+ '<input type="hidden" id="video_name_b" name="video_name_b" value="' + page.video_name_b + '" />'
					+ '<input type="hidden" id="selected_value" name="selected_value" value="" />'
					+ '<input type="hidden" id="mt_comments" name="mt_comments" value="" />'
					//+ '<input disabled="true" type="submit" style="height:50px; width:1000px" id="mt_submit" name="Submit" value="Submit HIT" onclick="onSubmit(this);" />'
						//onmousedown="javascript:document.getElementById(\'mt_comments\').value=document.getElementById(\'mt_comments_textbox\').value;" />'
					+ '</form>'
					+ '</td></tr></table>';
				//console.log(html_submit_str);

		$('#submit_region').append(html_submit_str);

}

// Processing the selection_list and choices_dict
// Post all labels in one shot
function onSubmit(event){
	
	console.log(selected_value);
	$('#selected_value').val(selected_value);
	document.getElementById("amt-form").submit();
};


function setSubmitButtonVisibility(){
	console.log(selected_value);
	console.log(video_finished_a);
	console.log(video_finished_b);
	
	if (selected_value != null && video_finished_a && video_finished_b) {
			document.getElementById("mt_submit").disabled = false;
	}else{
			if (video_finished_a == false || video_finished_b == false) {
				$("#mt_submit").text('Submit HIT (Please finish watching the videos)');
			}
			document.getElementById("mt_submit").disabled = true;
	}
};
