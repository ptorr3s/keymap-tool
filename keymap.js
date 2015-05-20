var excelbuilder = require('msexcel-builder');
var fs = require('fs');
var colors = require('colors');

var presentation_id_map,
    slide_map,
    keymessage_map;

var keymap_id = [],
    presentation_id = [],
    presentation_slides =[],
    _product = [],
    _external_id = [],
    slide_id = [],
    slide_keymessage = [],
    slide_keymessage_display = [],
    slide_name = []; // array for slide names;
    slide_description = []; // array for slide description

if(process.argv[2] != undefined || process.argv[2] != null){ // check if a presentation ID is passed
    var keymessages_id = []; // array for presentations IDs
    if(process.argv[2] == 'test'){
      checkForFiles();
    }else{
      for(var m = 2; m <= process.argv.length - 1; m++ ){
        keymessages_id.push(process.argv[m]);
      }
      createKeymessageMap.apply(this, keymessages_id)
    }
}else{
  console.log("NO PRESENTATION ID PROVIDED" .red.underline)
}

// Test to make sure you place it the script in the root folder
function checkForFiles(){
  try{
      presentation_id_map = fs.readFileSync('src/parameters/presentation.json');
      console.log(colors.green.bold('presentation.js file FOUND'))
    } catch(err){
      if (err.code !== 'ENOENT') {
        throw e;
      } else {
        console.log(colors.red.bold('presentation.json FILE NOT FOUND!'));
        return false;
      }
  }

  try{
      slide_map = fs.readFileSync('src/parameters/slide.json');
      console.log(colors.green.bold('slide.js file FOUND'));
    } catch(err){
      if (err.code !== 'ENOENT') {
        throw e;
      } else {
        console.log(colors.red.bold('slide.json FILE NOT FOUND!'));
        return false;
      }
  }

  try{
      keymessage_map = fs.readFileSync('src/parameters/keymessage.json');
      console.log(colors.green.bold('keymessage.js file FOUND'));
    } catch(err){
      if (err.code !== 'ENOENT') {
        throw e;
      } else {
        console.log(colors.red.bold('keymessage.json FILE NOT FOUND!'));
        return false;
      }
  }
}

// Create key message map
function createKeymessageMap(){
  keymap_id = [].slice.call(arguments);
  presentation_id_map = fs.readFileSync('src/parameters/presentation.json');
  presentation_id_map = JSON.parse(presentation_id_map)

  slide_map = fs.readFileSync('src/parameters/slide.json');
  slide_map = JSON.parse(slide_map);

  keymessage_map = fs.readFileSync('src/parameters/keymessage.json');
  keymessage_map = JSON.parse(keymessage_map);

    for (var h = 0; h <= presentation_id_map.presentation.length - 1; h++){
      presentation_id.push(presentation_id_map.presentation[h].id)
    }
    // Find product name, presentation slides, external ID
    for (var c = 0; c < keymap_id.length; c++){
      if(presentation_id_map.presentation[keymap_id[c] - 1] != undefined){
        for (var y = 0; y < presentation_id.length; y++){
          if(presentation_id_map.presentation[y].id == keymap_id[c]){
            for (var s = 0; s <= presentation_id_map.presentation[y].slide.length - 1; s++){
              presentation_slides.push(presentation_id_map.presentation[y].slide[s]);
              _product.push(presentation_id_map.presentation[y].name);
              if(presentation_id_map.presentation[y].external_id === undefined){
                _external_id.push('MISSING_EXTID');
              }else{
                _external_id.push(presentation_id_map.presentation[y].external_id);
              }
            }
          }
        }
        console.log(colors.yellow('PRESENTATION WITH ID ' + arguments[c] + ' FOUND'))
      }else{
        console.log(colors.red('PRESENTATION WITH ID ' + arguments[c] .bold + ' NOT FOUND'));
        if(arguments.length <= 1) {
          return false;
        }
      }
    }
    // Find slide name, slide description, slide keymessage
    for (a = 0; a < presentation_slides.length; a ++){
      for (var q = 0; q < slide_map.slide.length; q++){
        if(presentation_slides[a] === slide_map.slide[q].id){
          slide_id.push(slide_map.slide[q].id)
          slide_name.push(slide_map.slide[q].name);
          slide_description.push(slide_map.slide[q].description);
          slide_keymessage.push(slide_map.slide[q].keymessage[0])
        }
      }
    }
    // Find display order, Product name and ID
    for (var q = 0; q < slide_keymessage.length; q++){
      for (var a = 0; a < keymessage_map.keymessage.length; a ++){
        if(keymessage_map.keymessage[a].id == slide_keymessage[q]){
          slide_keymessage_display.push(keymessage_map.keymessage[a].display_order)
          var _PRODUCTNAME = keymessage_map.keymessage[a].product;
          var _PRODUCTNAME_ID = keymessage_map.keymessage[a].product_id;
        }
      }
    }
    var _DATE = new Date();
    var presentation_length = presentation_slides.length
    presentation_length += 5; //We add five to skip the title on the column
   
    var slide_name_length = slide_name.length
    slide_name_length += 5; //We add five to skip the title on the column

    // Create a new workbook file in current working-path 
    var title = _PRODUCTNAME.toLowerCase() + '-keymessage-map.xlsx';
    var workbook = excelbuilder.createWorkbook('./', title)
    // Create a new worksheet with 10 columns and X rows 
    var sheet1 = workbook.createSheet('sheet1', 10, presentation_length);
    
    // Fill Data 
    sheet1.set(1, 2, 'Product');
    sheet1.set(2, 2, 'Product ID');
    sheet1.set(3, 2, 'Created');
    sheet1.set(1, 5, 'Presentation Name');
    sheet1.set(2, 5, 'Presentation External ID');
    sheet1.set(3, 5, 'Slide External ID');
    sheet1.set(4, 5, 'Key Message');
    sheet1.set(5, 5, 'Description');
    sheet1.set(6, 5, 'Media File Name');
    sheet1.set(7, 5, 'Display Order');
    sheet1.set(8, 5, 'Active');
    sheet1.set(9, 5, 'Disabled Actions');

    sheet1.merge({col:1,row:1},{col:10,row:1});
    sheet1.align(1, 1, 'center')
    sheet1.align(1, 1, 'center')
    sheet1.align(8, 5, 'center')
    sheet1.align(9, 5, 'center')

    sheet1.width(1, 20)
    sheet1.width(2, 25)
    sheet1.width(3, 40)
    sheet1.width(4, 40)
    sheet1.width(5, 25)
    sheet1.width(6, 55)
    sheet1.width(7, 15)
    sheet1.width(8, 10)
    sheet1.width(9, 20)

    sheet1.font(1, 1, {name:'Arial',sz:'13',family:'3',scheme:'-',bold:'true',iter:'false'});
    sheet1.font(1, 2, {name:'Arial',sz:'12',family:'3',scheme:'-',bold:'true',iter:'false'});
    sheet1.font(2, 2, {name:'Arial',sz:'12',family:'3',scheme:'-',bold:'true',iter:'false'});
    sheet1.font(3, 2, {name:'Arial',sz:'12',family:'3',scheme:'-',bold:'true',iter:'false'});
    sheet1.font(1, 5, {name:'Arial',sz:'12',family:'3',scheme:'-',bold:'true',iter:'false'});
    sheet1.font(2, 5, {name:'Arial',sz:'12',family:'3',scheme:'-',bold:'true',iter:'false'});
    sheet1.font(3, 5, {name:'Arial',sz:'12',family:'3',scheme:'-',bold:'true',iter:'false'});
    sheet1.font(4, 5, {name:'Arial',sz:'12',family:'3',scheme:'-',bold:'true',iter:'false'});
    sheet1.font(5, 5, {name:'Arial',sz:'12',family:'3',scheme:'-',bold:'true',iter:'false'});
    sheet1.font(6, 5, {name:'Arial',sz:'12',family:'3',scheme:'-',bold:'true',iter:'false'});
    sheet1.font(7, 5, {name:'Arial',sz:'12',family:'3',scheme:'-',bold:'true',iter:'false'});
    sheet1.font(8, 5, {name:'Arial',sz:'12',family:'3',scheme:'-',bold:'true',iter:'false'});
    sheet1.font(9, 5, {name:'Arial',sz:'12',family:'3',scheme:'-',bold:'true',iter:'false'});

    sheet1.set(1, 1, 'Takeda - ' + _PRODUCTNAME + ' - Key Message Map')
    sheet1.set(1, 3, _PRODUCTNAME);
    sheet1.set(2, 3, _PRODUCTNAME_ID);
    sheet1.set(3, 3, _DATE)
    
    for (var t = 6; t <= presentation_length; t++){
      sheet1.set(1, t, _product[t - 6]);
      if(_external_id[t - 6] === 'MISSING_EXTID'){
        sheet1.fill(2, t, {type:'solid',fgColor:'FFFF0000',bgColor:'64'});
      }
      sheet1.set(2, t, _external_id[t - 6]);
      sheet1.set(7, t, slide_keymessage_display[t - 6]);

      if(keymessage_map.keymessage[t - 6].active === true){
        sheet1.set(8, t, 'checked');
      }else{
        sheet1.set(8, t, keymessage_map.keymessage[t - 6].active);
      }
      if(keymessage_map.keymessage[t - 6].disable_Actions_vod === ""){
        sheet1.set(9, t, "-");
      }else{
        sheet1.set(9, t, keymessage_map.keymessage[t - 6].disable_Actions_vod);
      }
      sheet1.align(7, t, 'center')
      sheet1.align(8, t, 'center')
      sheet1.align(9, t, 'center')
   }
    for (var y = 6; y <= slide_name_length; y++){
      sheet1.set(3, y, _external_id[y -6] + "_" + _product[y-6] + "_" + slide_name[y - 6]);
      sheet1.set(4, y, _external_id[y-6] + "_" + slide_name[y - 6]);
      sheet1.set(5, y, slide_description[y - 6]);
      sheet1.set(6, y, _external_id[y-6] + "_" + slide_name[y - 6] + ".zip");
    }
   console.log(colors.green.bold('KEY MESSAGE MAP FOR ' + _PRODUCTNAME + ' CREATED SUCCESFULLY'));
   console.log(colors.cyan('last modified on ' + _DATE))
    // Save it 
    workbook.save(function(ok){
      if (!ok) {
        workbook.cancel();
      }else{
        console.log('congratulations, your workbook created');
      }
    });
}