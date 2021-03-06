var meetingId, topicId, normId, _title = 'CAC';
jQuery(function($) {
	//preview('1493463925789');
	viewMeeting();
});


function loadView(id) {
	$.ajax({
		type : "post",
		url : contextPath + '/meeting/selectMeetingByPrimaryKey.do',
		data : {
			id : id
		},
		beforeSend : function(XMLHttpRequest) {
		},
		success : function(rst, textStatus) {
			$.each(rst.value, function(key, value) {
				if (key == 'category') {
					value = rsd(value, '83');
				}
				if (key == 'status') {
					value = value == "1" ? "on" : "off";
				}
				if (key.indexOf('Date') != -1 || key.indexOf('time') != -1
						|| key.indexOf('Time') != -1
						|| key.indexOf('birthday') != -1) {
					value = value.substr(0, 16);
				}
				$("#dialog-message-view").find('#' + key).html(value);
			});
		},
		error : function() {
			alert("加载错误！");
		}
	});
}

function clearQparams() {
	$('#cc1').combotree('setValue', '');
	jQuery(cfg.grid_selector).jqGrid('setGridParam', {
		page : 1,
		postData : {
			detpId : ''
		}
	}).trigger("reloadGrid");
}

function topicCfg(id, title) {
	var dialog = $("#dialog-message")
			.removeClass('hide')
			.dialog(
					{
						modal : false,
						width : 800,
						title : "<div class='widget-header widget-header-small'><div class='widget-header-pd'>"
								+ title + "</div></div>",
						title_html : true,
						buttons : [

								{
									html : "<i class='ace-icon fa fa-check bigger-110'></i>&nbsp; 确定",
									"class" : "btn btn-info btn-xs",
									id : "btn-submit",
									click : function() {
										$('#fm-topic-cfg').submit();

									}
								},
								{
									html : "<i class='ace-icon fa fa-times bigger-110'></i>&nbsp; 取消",
									"class" : "btn btn-xs",
									click : function() {
										$(this).dialog("close");
									}
								}]
					});
	selectAllTopic(id);
}

function selectAllTopic(id, name) {
	$.ajax({
		type : "post",
		url : contextPath + "/meeting/selectAllTopic.do",
		data : {
			meetingId : id,
			name : name
		},
		beforeSend : function(XMLHttpRequest) {
		},
		success : function(rst, textStatus) {
			var defaultValue = '';
			if (name) {
				defaultValue = name;
			}
			var html = [];
			html.push("<form id='fm-topic-cfg' onsubmit='return ckform()'>");
			html.push("<div style='text-align:right;padding-bottom:2px'>");
			html.push("搜索 <input type='text' id='_q' name='_q' value='"
					+ defaultValue + "' />");
			html.push("</div>");
			html.push("<div class='panel panel-default'>");
			html.push("<div class='panel-body'>");
			html.push("<input type='hidden' name='meetingId' value='" + id);
			html.push("'/>");

			html.push("<table class='table'>");
			//html.push("<tr><td style='text-align:right'>");
			//html.push("搜索 <input type='text' id='_q' name='_q' value='"+defaultValue+"' />");
			//html.push("</td></tr>");
			$.each(rst, function(i, o) {
				html.push("<tr><td>");
				html.push("<input type='");
				html.push("checkbox' id='");
				html.push(o.category.code);
				html.push("' class='xcheckgroup");
				html.push(o.category.code);
				html.push(" checkAllCurrent' /> ");
				html.push("<label style='");
				html.push("font-weight:800' for='");
				html.push(o.category.code);
				html.push("'>");
				html.push(o.category.name);
				html.push("</label>");
				html.push("</td></tr>");
				html.push("<tr><td>");
				$.each(o.items, function(j, e) {
					var checked = "";
					if (e.value) {
						checked = "checked";
					}
					html.push("<div class='checkboxitem'>");
					html
							.push("<input type='checkbox' name='" + e.id
									+ "' id='");
					html.push(e.id);
					html.push("' class='xcheckgroup");
					html.push(o.category.code);
					html.push(" checkItem' value='");
					html.push(e.id);
					html.push("' ");
					html.push(checked);
					html.push("/> <label for='");
					html.push(e.id);
					html.push("' >");
					html.push(e.name);
					html.push("</label>");
					html.push("</div>");
				});
				html.push("</td></tr>");
				$.XCheck({
					groupClass : ".xcheckgroup" + o.category.code,
					afterCheckItem : function() {
						var ops = this.options;
						console.log('当前的options为：' + JSON.stringify(ops));
						console.log("afterCheckItem");
					}
				});
			});
			html.push("</table>");
			html.push("</div></div></form>");
			$("#dialog-message").html(html.join(""));
			$('#_q').bind('keypress', function(event) {
				if (event.keyCode == "13") {
					//alert('你输入的内容为：' + $('#_q').val());
					selectAllTopic(id, $('#_q').val());
				}
			});
			$('#fm-topic-cfg').ajaxForm({
				beforeSubmit : function(formData, jqForm, options) {
					var params = {};
					$.each(formData, function(n, obj) {
						params[obj.name] = obj.value;
					});
					inertMeetingTopic(params.meetingId, params);
					return false;
				}
			});
		},
		error : function() {
			alert("加载错误！");
		}
	});
}
function inertMeetingTopic(id, p) {
	var params = [];

	$.each(p, function(key, value) {
		if ((key != 'meetingId') && (key != '_q')) {
			params.push({
				meetingId : id,
				topicId : value
			});
		}
	});
	console.log(params);
	$.ajax({
		type : "post",
		url : contextPath + "/meeting/insertMeetingTopic.do",
		data : {
			meetingId : id,
			name : p._q,
			jsons : JSON.stringify(params)
		},
		beforeSend : function(XMLHttpRequest) {
			$("#btn-submit").attr('disabled', true);
		},
		success : function(rst, textStatus) {
			viewTopic(id, p._q)
			$("#btn-submit").removeAttr("disabled");
			alert(rst.errorMessage);
		},
		error : function() {
			$("#btn-submit").removeAttr("disabled");
			alert("加载错误！");
		}
	});
}
function ckform() {
	return false;
}

function viewTopic(meetingId, name) {
	var tableId = "detail";
	if ($('#' + tableId).hasClass('dataTable')) {
		dttable = $('#' + tableId).dataTable();
		dttable.fnClearTable(); // 清空一下table
		dttable.fnDestroy(); // 还原初始化了的datatable
	}
	var table = $('#' + tableId)
			.DataTable(
					{
						ajax : {
							url : contextPath
									+ '/meeting/selectTopicByMeetingId.do?meetingId='
									+ meetingId,
							dataSrc : 'data'
						},
						columns : [{
							data : 'rownum'
						}, {
							data : 'name'
						}, {
							data : 'owner'
						}, {
							data : 'id'
						}],
						bAutoWidth : false,
						"fnInitComplete" : function() {
							this.fnAdjustColumnSizing(true);
							$('[data-rel=tooltip]').tooltip();
						},
						"createdRow" : function(row, data, dataIndex) {
							$(row).children('td').eq(0).attr('style',
									'text-align: center;font-weight:800');
							/*$(row).children('td').eq(0).html(
									'<input type="radio" name="_id" id="' + data.id
											+ '" value="' + data.id + '" />');*/
							$(row)
									.children('td')
									.eq(2)
									.html(
											'<a href="javascript:cfgUser(\''
													+ data.id
													+ '\',\''
													+ data.name
													+ '\',\''
													+ meetingId
													+ '\')"><span class="badge badge-info">'
													+ data.owner
													+ '</span></a>');
							var btn = [];
							btn
									.push('<div class="hidden-sm hidden-xs action-buttons" style="text-align:right">');
							btn
									.push('<a data-rel="tooltip" data-placement="top" title="删除" class="red" href="javascript:deleteByMeetingIdAndTopicId(\''
											+ data.id
											+ '\',\''
											+ data.name
											+ '\',\''
											+ meetingId
											+ '\')"><i class="ace-icon fa fa-trash-o bigger-130"></i></a>');
							btn
									.push('<a data-rel="tooltip" data-placement="top" title="数据导入" class="blue" href="javascript:upload2(\''
											+ meetingId
											+ '\',\''
											+ data.id
											+ '\')"><i class="ace-icon fa fa-upload bigger-130"></i></a>');
							btn
									.push('<a data-rel="tooltip" data-placement="top" title="数据导出" class="blue" href="javascript:export2(\''
											+ meetingId
											+ '\',\''
											+ data.id
											+ '\')"><i class="ace-icon fa fa-download bigger-130"></i></a>');
							btn
									.push('<a data-rel="tooltip" data-placement="top" title="指标数据" class="blue" href="javascript:dataSetting1(\''
											+ meetingId
											+ '\',\''
											+ data.id
											+ '\',\''
											+ data.name
											+ '\')"><i class="ace-icon fa fa-plus-circle bigger-130"></i></a>');
							btn
									.push('<a data-rel="tooltip" data-placement="top" title="指标列表" class="blue" href="javascript:dataSetting2(\''
											+ meetingId
											+ '\',\''
											+ data.id
											+ '\',\''
											+ data.name
											+ '\')"><i class="ace-icon fa fa-play bigger-130"></i></a>');
							btn.push('</div>');
							$(row).children('td').eq(3).html(btn.join(''));

						},
						"aLengthMenu" : [5, 10, 15, 20],
						"oLanguage" : {
							"sLengthMenu" : "每页显示 _MENU_ 条记录",
							"sZeroRecords" : "对不起，查询不到任何相关数据",
							"sInfo" : "当前显示 _START_ 到 _END_ 条，共 _TOTAL_ 条记录",
							"sInfoEmpty" : "第 0 到 0 条记录，共 0 条",
							"sInfoFiltered" : "数据表中共为 _MAX_ 条记录)",
							"sProcessing" : "正在加载中...",
							"sSearch" : "搜索 ",
							"sUrl" : "",
							"oPaginate" : {
								"sFirst" : "",
								"sPrevious" : "",
								"sNext" : "",
								"sLast" : ""
							},
							"oAria" : {
								"sSortAscending" : ": 升序排列",
								"sSortDescending" : ": 降序排列"
							}
						}
					});

}

function cfgUser(id, title, meetingId) {
	var dialog = $("#dialog-user")
			.removeClass('hide')
			.dialog(
					{
						modal : true,
						width : 400,
						title : "<div class='widget-header widget-header-small'><div class='widget-header-pd'>"
								+ title + "</div></div>",
						title_html : true,
						buttons : [

								{
									html : "<i class='ace-icon fa fa-check bigger-110'></i>&nbsp; 确定",
									"class" : "btn btn-info btn-xs",
									id : "btn-submit2",
									click : function() {
										updateTopicOwner(meetingId, id, $(
												'#_user').combogrid("getValue"));
										$(this).dialog("close");
									}
								},
								{
									html : "<i class='ace-icon fa fa-times bigger-110'></i>&nbsp; 取消",
									"class" : "btn btn-xs",
									click : function() {
										$(this).dialog("close");
									}
								}]
					});

	$('#_user').combogrid({
		panelWidth : 350,
		width : 375,
		idField : 'USER_ID',
		textField : 'NAME',
		url : portalPath + '/system/selectUsers.do',
		mode : 'remote',
		onSelect : function(row) {

		},
		columns : [[{
			field : 'USER_ID',
			title : '用户编号',
			width : 100
		}, {
			field : 'NAME',
			title : '姓名',
			width : 100
		}, {
			field : 'DEPARTMENT_NAME',
			title : '部门',
			width : 100
		}]]
	});
}
function updateTopicOwner(meetingId, topicId, userId) {
	$.ajax({
		type : "post",
		url : contextPath + "/meeting/updateTopicOwner.do",
		data : {
			meetingId : meetingId,
			topicId : topicId,
			userId : userId
		},
		beforeSend : function(XMLHttpRequest) {
			$("#btn-submit2").attr('disabled', true);
		},
		success : function(rst, textStatus) {
			viewTopic(meetingId, null);
			$("#btn-submit2").removeAttr("disabled");

		},
		error : function() {
			$("#btn-submit2").removeAttr("disabled");
			alert("加载错误！");
		}
	});
}
function deleteByMeetingIdAndTopicId(topicId, title, meetingId) {
	if (confirm("确定要删除" + title + "吗？")) {
		$.ajax({
			type : "post",
			url : contextPath + "/meeting/deleteByMeetingIdAndTopicId.do",
			data : {
				meetingId : meetingId,
				topicId : topicId
			},
			beforeSend : function(XMLHttpRequest) {

			},
			success : function(rst, textStatus) {
				viewTopic(meetingId, null);

			},
			error : function() {

				alert("加载错误！");
			}
		});
	}

}

function attendanceCfg(id, title) {
	var dialog = $("#dialog-meeting-user")
			.removeClass('hide')
			.dialog(
					{
						modal : false,
						width : 800,
						title : "<div class='widget-header widget-header-small'><div class='widget-header-pd'>"
								+ title + "</div></div>",
						title_html : true,
						buttons : [

								{
									html : "<i class='ace-icon fa fa-check bigger-110'></i>&nbsp; 确定",
									"class" : "btn btn-info btn-xs",
									id : "btn-submit",
									click : function() {
										$('#fm-user-cfg').submit();

									}
								},
								{
									html : "<i class='ace-icon fa fa-times bigger-110'></i>&nbsp; 取消",
									"class" : "btn btn-xs",
									click : function() {
										$(this).dialog("close");
									}
								}]
					});
	selectAllUserDeptId(id);
}

function selectAllUserDeptId(id, name) {
	$.ajax({
		type : "post",
		url : contextPath + "/meeting/selectAllUserDeptId.do",
		data : {
			meetingId : id,
			name : name
		},
		beforeSend : function(XMLHttpRequest) {
		},
		success : function(rst, textStatus) {
			var defaultValue = '';
			if (name) {
				defaultValue = name;
			}
			var html = [];
			html.push("<form id='fm-user-cfg' onsubmit='return ckform()'>");
			html.push("<div style='text-align:right;padding-bottom:2px'>");
			html.push("搜索 <input type='text' id='_q1' name='_q1' value='"
					+ defaultValue + "' />");
			html.push("</div>");
			html.push("<div class='panel panel-default'>");
			html.push("<div class='panel-body'>");
			html.push("<input type='hidden' name='meetingId' value='" + id);
			html.push("'/>");
			html.push("<table class='table'>");
			$.each(rst, function(i, o) {
				html.push("<tr><td>");
				html.push("<input type='");
				html.push("checkbox' id='");
				html.push(o.category.code);
				html.push("' class='xcheckgroup");
				html.push(o.category.code);
				html.push(" checkAllCurrent' /> ");
				html.push("<label style='");
				html.push("font-weight:800' for='");
				html.push(o.category.code);
				html.push("'>");
				html.push(o.category.name);
				html.push("</label>");
				html.push("</td></tr>");
				html.push("<tr><td>");
				$.each(o.items, function(j, e) {
					var checked = "";
					if (e.value) {
						checked = "checked";
					}
					html.push("<div class='checkboxitem'>");
					html
							.push("<input type='checkbox' name='" + e.id
									+ "' id='");
					html.push(e.id);
					html.push("' class='xcheckgroup");
					html.push(o.category.code);
					html.push(" checkItem' value='");
					html.push(e.id);
					html.push("' ");
					html.push(checked);
					html.push("/> <label for='");
					html.push(e.id);
					html.push("' >");
					html.push(e.name);
					html.push("</label>");
					html.push("</div>");
				});
				html.push("</td></tr>");
				$.XCheck({
					groupClass : ".xcheckgroup" + o.category.code,
					afterCheckItem : function() {
						var ops = this.options;
						console.log('当前的options为：' + JSON.stringify(ops));
						console.log("afterCheckItem");
					}
				});
			});
			html.push("</table>");
			html.push("</div></div></form>");
			$("#dialog-meeting-user").html(html.join(""));
			$('#_q1').bind('keypress', function(event) {
				if (event.keyCode == "13") {
					//alert('你输入的内容为：' + $('#_q').val());
					selectAllUserDeptId(id, $('#_q1').val());
				}
			});
			$('#fm-user-cfg').ajaxForm({
				beforeSubmit : function(formData, jqForm, options) {
					var params = {};
					$.each(formData, function(n, obj) {
						params[obj.name] = obj.value;
					});
					insertMeetingUser(params.meetingId, params);
					return false;
				}
			});
		},
		error : function() {
			alert("加载错误！");
		}
	});
}
function insertMeetingUser(id, p) {
	var params = [];

	$.each(p, function(key, value) {
		if ((key != 'meetingId') && (key != '_q1')) {
			params.push({
				meetingId : id,
				userId : value,
				mandatory : 'NO',
				present : '0'
			});
		}
	});
	console.log(params);
	$.ajax({
		type : "post",
		url : contextPath + "/meeting/insertMeetingUser.do",
		data : {
			meetingId : id,
			name : p._q1,
			jsons : JSON.stringify(params)
		},
		beforeSend : function(XMLHttpRequest) {
			$("#btn-submit").attr('disabled', true);
		},
		success : function(rst, textStatus) {
			viewUser(id);
			$("#btn-submit").removeAttr("disabled");
			alert(rst.errorMessage);
		},
		error : function() {
			$("#btn-submit").removeAttr("disabled");
			alert("加载错误！");
		}
	});
}

function viewUser(meetingId) {
	var tableId = "detail1";
	if ($('#' + tableId).hasClass('dataTable')) {
		dttable = $('#' + tableId).dataTable();
		dttable.fnClearTable(); // 清空一下table
		dttable.fnDestroy(); // 还原初始化了的datatable
	}
	var table = $('#' + tableId)
			.DataTable(
					{
						ajax : {
							url : contextPath
									+ '/meeting/selectUserByMeetingId.do?meetingId='
									+ meetingId,
							dataSrc : 'data'
						},
						columns : [{
							data : 'rownum'
						}, {
							data : 'roleName'
						}, {
							data : 'name'
						}, {
							data : 'mandatory'
						}, {
							data : 'user_id'
						}],
						bAutoWidth : false,
						"fnInitComplete" : function() {
							this.fnAdjustColumnSizing(true);
							$('[data-rel=tooltip]').tooltip();
						},
						"createdRow" : function(row, data, dataIndex) {
							$(row).children('td').eq(0).attr('style',
									'text-align: center;font-weight:800');
							$(row)
									.children('td')
									.eq(3)
									.html(
											'<a href="javascript:updateMandatory(\''
													+ data.user_id
													+ '\',\''
													+ data.mandatory
													+ '\',\''
													+ meetingId
													+ '\')"><span class="badge badge-info">'
													+ data.mandatory
													+ '</span></a>');

							var html=[];
							var present="checked";
							var absent="";
							var justified="";
							//alert(data.present);
							if(data.present=='Present'){
							    present="checked";
							}
							if(data.present=='Absent'){
                            	absent="checked";
                            }if(data.present=='Justified'){
                                justified="checked";
                            }
							html.push('<input type="radio" id="'+data.user_id+'Present" name="'+data.user_id+'" value="Present" '+present+'/>');
							html.push('<label for="'+data.user_id+'Present">Present</label>  ');

							html.push('<input type="radio" id="'+data.user_id+'Absent" name="'+data.user_id+'" value="Absent" '+absent+'/>');
                            html.push('<label for="'+data.user_id+'Absent">Absent</label>  ');

                            html.push('<input type="radio" id="'+data.user_id+'Justified" name="'+data.user_id+'" value="Justified" '+justified+'/>');
                            html.push('<label for="'+data.user_id+'Justified">Justified</label>');

							$(row).children('td').eq(4).html(html.join(''));

						},
						"aLengthMenu" : [5, 10, 15, 20],
						"oLanguage" : {
							"sLengthMenu" : "每页显示 _MENU_ 条记录",
							"sZeroRecords" : "对不起，查询不到任何相关数据",
							"sInfo" : "当前显示 _START_ 到 _END_ 条，共 _TOTAL_ 条记录",
							"sInfoEmpty" : "第 0 到 0 条记录，共 0 条",
							"sInfoFiltered" : "数据表中共为 _MAX_ 条记录)",
							"sProcessing" : "正在加载中...",
							"sSearch" : "搜索 ",
							"sUrl" : "",
							"oPaginate" : {
								"sFirst" : "",
								"sPrevious" : "",
								"sNext" : "",
								"sLast" : ""
							},
							"oAria" : {
								"sSortAscending" : ": 升序排列",
								"sSortDescending" : ": 降序排列"
							}
						}
					});

					$('#fm4').ajaxForm({
                    			beforeSubmit : function(formData, jqForm, options) {
                    				var params = {};
                    				var list = [];
                    				$.each(formData, function(n, obj) {
                    				    if(obj.name!='detail1_length'){
                    				        params[obj.name] = obj.value;
                    				        list.push({userId:obj.name,present:obj.value});
                    				    }

                    				});
                    				var data={};
                    				data.meetingId=meetingId;
                    				data.list=list;
                    				console.log(data);
                                    updatePresent(data);
                    				return false;
                    			}
                    		});

}
function updateMandatory(userId, mandatory, meetingId) {
	if (mandatory == "YES") {
		mandatory = "NO";
	} else {
		mandatory = "YES";
	}
	$.ajax({
		type : "post",
		url : contextPath + "/meeting/updateMandatory.do",
		data : {
			meetingId : meetingId,
			userId : userId,
			mandatory : mandatory
		},
		beforeSend : function(XMLHttpRequest) {

		},
		success : function(rst, textStatus) {
			viewUser(meetingId);

		},
		error : function() {

			alert("加载错误！");
		}
	});
}
function deleteByMeetingIdAndUserId(userId, name, meetingId) {
	if (confirm("确定要删除" + name + "吗？")) {
		$.ajax({
			type : "post",
			url : contextPath + "/meeting/deleteByMeetingIdAndUserId.do",
			data : {
				meetingId : meetingId,
				userId : userId
			},
			beforeSend : function(XMLHttpRequest) {

			},
			success : function(rst, textStatus) {
				viewUser(meetingId);

			},
			error : function() {

				alert("加载错误！");
			}
		});
	}
}

function delMeetingById(name, id) {
	if (confirm("确定要关闭" + name + "吗？")) {
		$.ajax({
			type : "post",
			url : contextPath + "/meeting/deleteMeetingByMeetingId.do",
			data : {
				jsons : JSON.stringify({
					id : id
				})
			},
			beforeSend : function(XMLHttpRequest) {

			},
			success : function(rst, textStatus) {
				jQuery(cfg.grid_selector).jqGrid('setGridParam', {
					page : 1
				}).trigger("reloadGrid");

			},
			error : function() {

				alert("加载错误！");
			}
		});
	}
}

function previewNorm(meetingId, topicId, title) {
	var dialog = $("#dialog-norm")
			.removeClass('hide')
			.dialog(
					{
						modal : false,
						width : 800,
						title : "<div class='widget-header widget-header-small'><div class='widget-header-pd'>"
								+ title + "</div></div>",
						title_html : true,
						buttons : [

						{
							html : "<i class='ace-icon fa fa-check bigger-110'></i>&nbsp; 关闭",
							"class" : "btn btn-info btn-xs",
							click : function() {
								$(this).dialog("close");
							}
						}]
					});
	viewNorm(meetingId, topicId, title);
}
function viewNorm(meetingId, topicId, title) {
	var tableId = "detail4";
	if ($('#' + tableId).hasClass('dataTable')) {
		dttable = $('#' + tableId).dataTable();
		dttable.fnClearTable(); // 清空一下table
		dttable.fnDestroy(); // 还原初始化了的datatable
	}
	$('#' + tableId)
			.DataTable(
					{
						ajax : {
							url : contextPath
									+ '/norm/selectNormByTopicId.do?topicId='
									+ topicId,
							dataSrc : 'data'
						},
						columns : [{
							data : 'rownum'
						}, {
							data : 'name'
						}, {
							data : 'remark'
						}, {
							data : 'remark'
						}],
						bAutoWidth : false,
						"fnInitComplete" : function() {
							this.fnAdjustColumnSizing(true);
							$('[data-rel=tooltip]').tooltip();
						},
						"createdRow" : function(row, data, dataIndex) {
							$(row).children('td').eq(0).attr('style',
									'text-align: center;font-weight:800');
							var btn = [];
							btn
									.push('<div class="hidden-sm hidden-xs action-buttons" style="text-align:right">');
							btn
									.push('<a data-rel="tooltip" data-placement="top" title="编辑不良现象明细数据" class="blue" href="javascript:dataSetting3(\''
											+ meetingId
											+ '\',\''
											+ topicId
											+ '\',\''
											+ data.id
											+ '\',\''
											+ title
											+ '\')"><i class="ace-icon fa fa-plus-circle bigger-130"></i></a>');
							btn
									.push('<a data-rel="tooltip" data-placement="top" title="预览" class="blue" href="javascript:previewChart(\''
											+ meetingId
											+ '\',\''
											+ topicId
											+ '\',\''
											+ data.id
											+ '\')"><i class="ace-icon fa fa-play bigger-130"></i></a>');
							btn
									.push('<a data-rel="tooltip" data-placement="top" title="任务" class="blue" href="javascript:previewTpa(\''
											+ meetingId
											+ '\',\''
											+ topicId
											+ '\',\''
											+ data.id
											+ '\')"><i class="ace-icon fa fa-play bigger-130"></i></a>');
							btn.push('</div>');

							$(row).children('td').eq(3).html(btn.join(''));

						},
						"aLengthMenu" : [5, 10, 15, 20],
						"oLanguage" : {
							"sLengthMenu" : "每页显示 _MENU_ 条记录",
							"sZeroRecords" : "对不起，查询不到任何相关数据",
							"sInfo" : "当前显示 _START_ 到 _END_ 条，共 _TOTAL_ 条记录",
							"sInfoEmpty" : "第 0 到 0 条记录，共 0 条",
							"sInfoFiltered" : "数据表中共为 _MAX_ 条记录)",
							"sProcessing" : "正在加载中...",
							"sSearch" : "搜索 ",
							"sUrl" : "",
							"oPaginate" : {
								"sFirst" : "",
								"sPrevious" : "",
								"sNext" : "",
								"sLast" : ""
							},
							"oAria" : {
								"sSortAscending" : ": 升序排列",
								"sSortDescending" : ": 降序排列"
							}
						}
					});

}
function upload1(meetingId) {
	var url = contextPath + '/normData/importXls.do';
	var params = {
		meetingId : meetingId
	};
	upload(params, url)
}

function upload2(meetingId, topicId) {
	var url = contextPath + '/normDetail/importXls.do';
	var params = {
		meetingId : meetingId,
		topicId : topicId
	};
	upload(params, url)
}
function export1(meetingId) {
	location.href = contextPath + "/normData/exportXls.do?meetingId="
			+ meetingId;
	alert("正在导出，请稍后.......")
}
function export2(meetingId, topicId) {
	location.href = contextPath + "/normDetail/exportXls.do?meetingId="
			+ meetingId + "&topicId=" + topicId;
	alert("正在导出，请稍后.......")
}

function topicSetting() {
	topicCfg(meetingId, _title);
}
function userSetting() {
	attendanceCfg(meetingId, _title);
}

function dataSetting1(_meetingId, _topicId, title) {
	parent.addPanel(title + " 指标数据", contextPath
			+ '/dynamic/service/normData/index.jsp?meetingId=' + _meetingId
			+ '&topicId=' + _topicId, true);
}
function dataSetting2(_meetingId, _topicId, title) {
	previewNorm(_meetingId, _topicId, title)
}

function dataSetting3(_meetingId, _topicId, _normId, title) {

	parent.addPanel(title + " 不良现象", contextPath
			+ '/dynamic/service/normDetail/index.jsp?meetingId=' + _meetingId
			+ '&topicId=' + _topicId + '&normId=' + _normId, true);
}
function previewChart(_meetingId, _topicId, _normId, title) {
	var url = contextPath + '/dynamic/service/preview/index.jsp?meetingId='
			+ _meetingId + '&topicId=' + _topicId + '&normId=' + _normId;
	window.open(url);
}
function previewTpa(_meetingId, _topicId, _normId, title) {
	var url = contextPath + '/dynamic/service/tpa/index.jsp?meetingId='
			+ _meetingId + '&topicId=' + _topicId + '&normId=' + _normId;
	window.open(url);
}

function viewMeeting(name) {
	$.ajax({
		type : "post",
		url : contextPath + '/meeting/findMeetingList.do',
		data : {
			name : name,
			status:'2'
		},
		success : function(rst) {
			var html = [];


			$(rst.rows).each(function(i, o) {

			    var bg="#FFFFFF";
			    if(i==0){

			        bg="#eeeeee";
			        act1(o.id);
			    }
				html.push("<tr><td style='height:60px;background-color:"+bg+"' id='"+o.id+"'>");
                html.push("<div class='row'>");

				html.push("<div class='col-md-8'>");
				html.push("<div class='meeting1'>");
				html.push(o.meetingDate);
				html.push("</div>");
				html.push("<div class='meeting2'>");
                html.push(o.divisionName);
                html.push(' ');
                html.push(o.site);
                html.push("</div>");
                html.push("<div class='meeting2'>");
                html.push('<a class="blue" href="javascript:previewMeeting()"');
                html.push(' data-rel="tooltip" data-placement="right" title="'+o.discribtion+'">');
                html.push(o.name);
                html.push("</a>");
                html.push("</div>");
                html.push("<div class='meeting3'>");
                html.push(o.ownerName);
                html.push("</div>");
                html.push("</div>");
                html.push("<div class='col-md-4'><div class='meeting4'>");

                html.push('<a class="blue" href="javascript:act1(\''+o.id+'\')" data-rel="tooltip" data-placement="top" title="Lanuch"><i class="ace-icon fa fa-play bigger-150"></i></a>');
               html.push('<br> Lanuch');
               html.push('<br>');
               html.push('<a class="red" href="javascript:act2(\''+o.id+'\')" data-rel="tooltip" data-placement="top" title="Close"><i class="ace-icon fa fa-stop bigger-150"></i></a>');
               html.push('<br> Close  ');
                html.push("</div></div>");
                html.push("</div>");




				html.push("</td></tr>");
			});

			$("#meeting-grid").html(html.join(""));
			$('[data-rel=tooltip]').tooltip();
			$('#nav-search-input').bind('keypress', function(event) {
            				if (event.keyCode == "13") {
            					viewMeeting($('#nav-search-input').val());
            				}
            			});
            			$('#nav-search-input').val(name)
		}
	});
}
function act1(id) {
	meetingId = id;
	loadView(id);
	viewTopic(id);
	viewUser(id);
	$('[data-rel=tooltip]').tooltip();
	var list=$("#meeting-grid").find("td");
	$(list).each(function(i,o){
	    console.log(o);
	    if($(o).attr("id")==id){
	        $(o).css("background-color","#eeeeee");
	    }else{
	        $(o).css("background-color","#FFFFFF");
	    }
	});


}
function act2(id){
$.ajax({
		type : "post",
		url : contextPath + '/meeting/deleteMeetingByMeetingId.do',
		data : {
			jsons:JSON.stringify({id:id})
		},
		success : function(rst) {
            viewMeeting();
            chart1();
		}
	});
}
function act3(){
viewMeeting($('#nav-search-input').val());
}
function updatePresent(data) {

	$.ajax({
		type : "post",
		url : contextPath + "/meeting/updatePresent.do",
		data : {text:JSON.stringify(data)
		},
		beforeSend : function(XMLHttpRequest) {

		},
		success : function(rst, textStatus) {
		    viewUser(data.meetingId);

			alert(rst.errorMessage);


		},
		error : function() {

			alert("加载错误！");
		}
	});
}
function presentSetting(){
    $("#fm4").submit();
}

jQuery(function($) {
	launchExample();
});
function initData() {
	chart1();
	chart2();
}
function initMyChar1() {
	if (myChart1 && myChart1.dispose) {
		myChart1.dispose();
	}
	myChart1 = echarts.init(document.getElementById('ct1'), curTheme);
	window.onresize = myChart1.resize;
	myChart1.setOption(option1, true);
	myChart1.hideLoading();
}
function initMyChar2() {
	if (myChart2 && myChart2.dispose) {
		myChart2.dispose();
	}
	myChart2 = echarts.init(document.getElementById('ct2'), curTheme);
	window.onresize = myChart2.resize;
	myChart2.setOption(option2, true);
	myChart2.hideLoading();
}
function chart1() {
	$.ajax({
		type : "post",
		url : contextPath + '/anslysis/query.do',
		data : {
		    reportId:'portal'
		},
		success : function(rst) {
            option1.series[0].data=rst.value;
            $(rst.value).each(function(i,o){
             option1.legend.data.push(o.name);
            });
			initMyChar1();
		}
	});
}
function chart2() {
	$.ajax({
		type : "post",
		url : contextPath + '/anslysis/query.do',
		data : {
		    reportId:'task',
		    userId:userProp.userId
		},
		success : function(rst) {

            $(rst.value).each(function(i,o){
                option2.xAxis[0].data.push(o.name);
            });
            $(rst.value).each(function(i,o){
                            option2.series[0].data.push(o.value);
                   });
			initMyChar2();
		}
	});
}
function myTask(){
    parent.addPanel("任务执行", contextPath+"/dynamic/service/tpaUserTask/index.jsp", true);
}