var _colNames =['编码','会议编码','议题编码','指标编码','产品编号','年度','上年度指标','wkt1','wkt2','wkt3','wkt4','wkt5','wkt6','wkt7','wkt8','wkt9','wkt10','wkt11','wkt12','wkt13','wkt14','wkt15','wkt16','wkt17','wkt18','wkt19','wkt20','wkt21','wkt22','wkt23','wkt24','wkt25','wkt26','wkt27','wkt28','wkt29','wkt30','wkt31','wkt32','wkt33','wkt34','wkt35','wkt36','wkt37','wkt38','wkt39','wkt40','wkt41','wkt42','wkt43','wkt44','wkt45','wkt46','wkt47','wkt48','wkt49','wkt50','wkt51','wkt52','wkt53','wkc1','wkc2','wkc3','wkc4','wkc5','wkc6','wkc7','wkc8','wkc9','wkc10','wkc11','wkc12','wkc13','wkc14','wkc15','wkc16','wkc17','wkc18','wkc19','wkc20','wkc21','wkc22','wkc23','wkc24','wkc25','wkc26','wkc27','wkc28','wkc29','wkc30','wkc31','wkc32','wkc33','wkc34','wkc35','wkc36','wkc37','wkc38','wkc39','wkc40','wkc41','wkc42','wkc43','wkc44','wkc45','wkc46','wkc47','wkc48','wkc49','wkc50','wkc51','wkc52','wkc53','创建人编码','创建人姓名','入库日期','最后更新人编码','最后更新人姓名','最后更新时间','操作'];
var _colModel = function() {
	return [
	{
	 {
                name: 'opt',
                width: 100,
                hidden:false,
                editable: false,
                sortable:false,
                renderer:function(value, cur){
                    return renderBtn(cur);
                }
            }
	];
}
function aceSwitch(cellvalue, options, cell) {
	console.log('aceSwitch');
	setTimeout(function() {
		$(cell).find('input[type=checkbox]').addClass(
				'ace ace-switch ace-switch-5').after(
				'<span class="lbl"></span>');
	}, 0);
}
// enable datepicker
function pickDate(cellvalue, options, cell) {
	setTimeout(function() {
		$(cell).find('input[type=text]').datepicker({
			format : 'yyyy-mm-dd',
			autoclose : true
		});
	}, 0);
}
function renderBtn(cur) {
	var id = $.jgrid.getAccessor(cur, 'id');
	var title = $.jgrid.getAccessor(cur, 'name');
	var html = [];
	html.push('<a target="_blank" href="');
	html.push('javascript:preview(\'' + id + '\',\'' + title + '\')');
	html.push('"');
	html.push('><span class="badge badge-info">查看</span></a>');
	return html.join(' ');
}