/**
 * common.js
 * 一般公開画面用　共通js
 */

$(function(){

    $(document).ajaxSend(function(event, jqxhr, settings) {
        settings.data = "token_id=" + tokenId + "&token=" + token + "&" + settings.data;
    });

    var ua = navigator.userAgent;

    $('#pcSearchResultArea').hide();
    $('#navMenuArea').hide();
    $('#langSelectArea').hide();

    $('input[type="text"]').attr('autocomplete', 'off');
    $('textarea').attr('autocomplete', 'off');

    // // ポップアップ表示中はbodyのスクロールを無効にする
	// $("#navMenuArea").hideShow(function(e, visibility){
	// 	if(visibility == "shown") {
    //         //$('body').addClass('stop_scrolling');
    //         $(window).on('onwheel wheel touchmove onmousewheel mousewheel',function(e){
    //             e.preventDefault();
    //         });
	// 	} else {
	// 		// スクロール無効クラス削除
	// 		//$('body').removeClass('stop_scrolling');
	// 	}
	// });

	// ポップアップの背景をクリックしたらポップアップを閉じる
	$(document).on('click touchend', function(event) {
        if($('#navMenuArea').is(':visible')) {
            if (!$(event.target).closest('#navMenuArea').length) {
                $("#navMenuArea").fadeOut('fast');
            }
        }
        if($('#pcSearchResultArea').is(':visible')) {
            if (!$(event.target).closest('#pcSearchResultArea').length) {
                $("#pcSearchResultArea").fadeOut('fast');
            }
        }
        if($('#langSelectArea').is(':visible')) {
            if (!$(event.target).closest('#langSelectArea').length) {
                $("#langSelectArea").fadeOut('fast');
            }
        }
    });
	$('.popup_bg').click(function(e) {
		$(this).fadeOut('fast');
	});
	$('.popup_box_l').click(function(e) {
		e.stopPropagation();
	});


    /*-----------------------------------------
	　【ヘッダー】
     -----------------------------------------*/

    /**
      * メニューボタンクリック
      */
     $('#btnShowMenu').click(function (e) {
        if($('#navMenuArea').is(':visible')) {
            $('#navMenuArea').fadeOut('fast');
        }else{
            $('#navMenuArea').fadeIn('fast');
        }
        $("#pcSearchResultArea").fadeOut('fast');
        e.stopPropagation();
    });
    $('#btnHideMenu').click(function () {
		$('#navMenuArea').fadeOut('fast');
    });
    /**
     * 検索ボックス表示ボタンクリック
     * ※スマホのみ
     */
    $('#btnShowSearch').click(function () {
		$('#spSearchArea').fadeIn('fast');
    });
    $('#btnHideSearch').click(function () {
		$('#spSearchArea').fadeOut('fast');
    });


    /*-----------------------------------------
	　【フッター】
     -----------------------------------------*/

    $('#btnLangSelect').click(function (e) {
        if($('#langSelectArea').is(':visible')) {
            $('#langSelectArea').fadeOut('fast');
        }else{
            $('#langSelectArea').fadeIn('fast');
        }
        e.stopPropagation();
    });


    /*-----------------------------------------
	　【ツール検索】
     -----------------------------------------*/

    /**
     * PC：ツール検索ボタンクリック
     */
    $('#btnHeaderToolSearch').click(function(e) {
        searchTools($('#headerSearchKeyword').val(), true);
        e.stopPropagation();
    });
    $('#headerSearchKeyword').keypress(function(e){
        if (e.which == 13) {
            searchTools($(this).val(), true);
        }
    } );

    /**
	 * スマホ：ツール検索ボタンクリック
	 */
	$('#btnToolSearch').click(function() {
        searchTools($('#searchKeyword').val(), false);
    });
    $('#searchKeyword').keypress(function(e){
        if (e.which == 13) {
            searchTools($(this).val(), false);
        }
    } );


    function searchTools(searchKeyword, isPc) {
        $.ajax({
            url: '../../get_search_tools_process.php',
            type: "POST",
            dataType: "json",
            data: {
                'search_text': searchKeyword, 
                'lang_id': $("#langIdBox").val()
            },
            timeout: 10000,
            beforeSend: function () {
                if(isPc){
                    $('#btnHeaderToolSearch').attr('disabled', true);
                    $("#pcSearchResultNotMsg").hide();
                    // $('#pcSearchResultArea #loadingRakko').fadeIn('fast');
                    $("#pcSearchResultUl").html("");
                    $("#pcSearchResultArea").fadeIn('fast');    
                }else{
                    $('#btnToolSearch').attr('disabled', true);
                    $("#searchTextInArea").hide();
                    $("#searchResultNotMsg").hide();
                    $("#searchResultUl").html("");
                }
            },
            complete: function () {
                if(isPc){
                    $('#btnHeaderToolSearch').attr('disabled', false);
                    // $('#pcSearchResultArea #loadingRakko').fadeOut('fast');
                }else{
                    $('#btnToolSearch').attr('disabled', false);
                }
            }
        }).then(
            function (result) {
                if(!isPc){
                    $("#searchTextInArea").show();
                }
                if(result == ''){
                    if(isPc){
                        $('#btnHeaderToolSearch').attr('disabled', false);
                        // $('#pcSearchResultArea #loadingRakko').fadeOut('fast');
                        $("#pcSearchResultNotMsg").show();
                    }else{
                        $('#btnToolSearch').attr('disabled', false);
                        $("#searchResultNotMsg").show();
                    }
                    return;
                }
                var resultHtml = '<ul>';
                $.each(result, function (id, toolVal) {
                    resultHtml += '<li><a href="/tools/'+toolVal["tool_id"]+'/">'+toolVal["title"]+'</a></li>';
                });
                resultHtml += '</ul>';
                if(isPc){
                    $("#pcSearchResultUl").html(resultHtml);
                }else{
                    $("#searchResultUl").html(resultHtml);
                }
            },
            function () {
                if(isPc){
                    // $('#pcSearchResultArea #loadingRakko').fadeOut('fast');
                }else{

                }
            }
        );

    }


    
    /*-----------------------------------------
	　【ポップアップメニュー】
     -----------------------------------------*/

    $(".favo_up_btn").click(function() {
        var upId = $(this).attr("name");
        $.cookie.json = true;
        var arrFavo = $.cookie("favo_list");
        if(arrFavo !== undefined && arrFavo !== null){
            var i = $.inArray(upId, arrFavo);
            arrFavo.splice(i, 2, arrFavo[i+1], arrFavo[i]);
            // cookie保存
            $.cookie("favo_list", arrFavo, { expires: 365, path: "/" });
        }
        var thisLi = $(this).parents("li");
        thisLi.prev("li").before(thisLi);
    });

    /*-----------------------------------------
	　【お気に入り】
     -----------------------------------------*/

    /**
     * お気に入り★クリック
     */
    $('.favo_btn').click(function(e) {
        setFavoCookie($(this), $(this).parents('a').attr('name'), $(this).next().children('.tool_title').text());
        e.preventDefault();
    });
    /**
     * ツールページ：お気に入り★クリック
     */
    $('.tool_favo_btn').click(function(e) {
        setFavoCookie($(this), $(this).attr('name'), $('h1 .h1_tool').text());
        e.preventDefault();
    });

    /**
     * ・お気に入り★スタイル変更
     * ・cookie更新
     * ・ポップアップメニュー更新
     * 
     * @param {*} starElem 
     * @param {*} toolId 
     * @param {*} listFlg 
     */
    function setFavoCookie(starElem, toolId, toolName) {
        // スタイル変更
        starElem.toggleClass("favo_on");
        $.cookie.json = true;
        var arrFavo = $.cookie("favo_list");
        if(arrFavo === undefined || arrFavo === null){
            arrFavo = [];
        }
        // 既にあれば削除する
        var i = $.inArray(toolId, arrFavo);
        if(i >= 0){
            arrFavo.splice(i, 1);
            // ポップアップメニュー内ツール削除
            $("#favoUl").children("li[name="+toolId+"]").remove();
            if($("#favoUl").children().length == 0){
                $("#favoUl").remove();
                $("#favoNotMsg").removeClass("invisible");
                $("#favoNotMsg").addClass("visible");
            }
        }else{
            arrFavo.push(toolId);
            // ポップアップメニュー内ツール追加
            if(!$("#favoUl").length){
                $("#favoNotMsg").before('<ul id="favoUl"></ul>');
                $("#favoNotMsg").addClass("invisible");
                $("#favoNotMsg").removeClass("visible");
            }
            $("#favoUl").prepend(
                '<li name="'+toolId+'"><p class="favo_list"><a href="/tools/'+toolId+'/">'
                +toolName+'</a><i name="'+toolId+'" class="favo_up_btn far fa-arrow-alt-circle-up"></i></p></li>');
        }
        // cookie保存
        $.cookie("favo_list", arrFavo, { expires: 365, path: "/" });

        

    }

    /**
     * お気に入りツール共有URLクリック
     */
    $('#favoShareUrl').click(function(e) {
        open($(this).attr("name"), "_blank" );
    });

    /**
     * お気に入りツール共有URLコピー
     */
    $('#btnCopyShareUrl').click(function(e) {
        copyClipboardText($('#favoShareUrl').attr("name"));
    });

    /**
     * ツールリンク　ドラッグ＆ドロップ
     */
    $('#favoToolSortableArea').sortable({
        update: function(){
            var arrToolId = $(this).sortable("toArray");
            var toolIdPuls = "";
            $.each(arrToolId,function(i,val){
                arrToolId[i] = val.replace(/favoTool_/g, "");
                toolIdPuls += arrToolId[i]+"+";
            });
            // リストURL更新
            toolIdPuls = toolIdPuls.slice(0, -1)
            $('#favoShareUrl').attr('name', $('#shareUrlStorage').val()+toolIdPuls);
            $('#favoShareUrl').text($('#shareUrlStorage').val()+toolIdPuls);
            // cookie保存
            $.cookie.json = true;
            $.cookie("favo_list", arrToolId.reverse(), { expires: 365, path: "/" });
        },
        scroll: false
        
    });
    // スマホは縦方向移動のみ可
    if (ua.indexOf('iPhone') > 0 || ua.indexOf('Android') > 0 && ua.indexOf('Mobile') > 0) {
        $('#favoToolSortableArea').sortable({
            axis: 'y',
            handle: '.tool_sortable_area'
        });
    }
    // ツールリンクのテキスト選択無効
    $("#favoToolSortableArea").disableSelection();

/*-----------------------------------------
　【ツール】
 -----------------------------------------*/

    // 掲載順シャッフル
    randomAdBanner();
    // スライドショー設定
    $('#adSlider').slick({
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        responsive: [
            {
                breakpoint: 1030,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    infinite: true,
                }
            },
            {
                breakpoint: 830,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    infinite: true,
                }
            },
            {
                breakpoint: 560,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true
                }
            }
        ],
    });


});

/**
 * 広告バナーの順番をシャッフルする
 */
function randomAdBanner() {
    $('#adSlider').find('.slick-slide').sort(function(){
        return Math.round(Math.random()) - 0.5;
    }).detach().appendTo($('#adSlider'));
}

function copyClipboardText(copyText) {
    var ua = navigator.userAgent;
    if (ua.indexOf('iPhone') > 0 || ua.indexOf('Android') > 0 || ua.indexOf('Mobile') > 0 || ua.indexOf('iPad') > 0){
        // スマホ、タブレット
        //　textareaをbodyタグの末尾に設置
        $(document.body).append("<textarea id=\"tmp_copy\" style=\"position:fixed;right:100vw;font-size:16px;\" readonly=\"readonly\">" + copyText + "</textarea>");
        //select()でtextarea内の文字を選択
        var elm = $("#tmp_copy")[0];
        elm.select();
        //rangeでtextarea内の文字を選択
        var range = document.createRange();
        range.selectNodeContents(elm);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        elm.setSelectionRange(0, 999999);
        // コピー
        document.execCommand("copy");
        //textareaを削除
        $(elm).remove();
    } else {
        // PC
        var copyStorage = document.createElement("textarea");
        copyStorage.value = copyText;
        document.body.appendChild(copyStorage);
        copyStorage.select();
        document.execCommand("copy");
        copyStorage.parentElement.removeChild(copyStorage);
    }
}


/**
 * 指定したテキストをCSVダウンロードする タブ区切り
 * @param {*} name
 * @param {*} downloadText
 */
function downloadCsv(name, downloadText) {
    var fileName = name + ".csv";
    //文字コードをBOM付きUTF-8に指定
    var bom = new Uint8Array([0xFF, 0xFE]);
    var arrUtf16Val = [];
    var cnt = downloadText.length;
    for (var i=0; i < cnt; i++){
        arrUtf16Val.push(downloadText.charCodeAt(i));
    }
    arrUtf16Val = new Uint16Array(arrUtf16Val);
    var blob = new Blob([bom, arrUtf16Val], {"type": "text/csv"});
    var a = jQuery("<a></a>", {href: window.URL.createObjectURL(blob),
        download: fileName,
        target: "_blank"})[0];
    if (window.navigator.msSaveBlob) {
        window.navigator.msSaveBlob(blob, fileName);
        window.navigator.msSaveOrOpenBlob(blob, fileName);
    } else if (window.URL && window.URL.createObjectURL) {
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else if (window.webkitURL && window.webkitURL.createObject) {
        a.click();
    } else {
        window.open('data:text/csv;charset=utf-16;' + ';base64,' + window.Base64.encode(downloadText), '_blank');
    }
}



function redirectToolPage(id) {
    window.location.href = 'https://rakko.tools/tools/'+id+'/';
}

function showToast(msg) {
    toastr.options = {
        positionClass: "toast-bottom-right",
        timeOut: 2000,
        extendedTimeOut: 0,
        fadeOut: 0,
        fadeIn: 0,
        showDuration: 0,
        hideDuration: 0,
        debug: false,
        showDuration: "100",
        hideDuration: "100"
    }
    toastr.success(msg);
}

function requestGtag() {
    if(location.host == "rakko.tools"){
        gtag('config', 'UA-135229555-1');
    }
}