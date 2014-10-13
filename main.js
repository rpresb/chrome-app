chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('main.html', {
    bounds: {
      width: 500,
      height: 300
    }
  });
});

function onInitFs(fs) {
  console.log('Opened file system: ' + fs.name);

  createDir(fs.root, "videos".split('/'));

		var xhr = new XMLHttpRequest();
		xhr.open('GET', "http://www.manualdomundo.com.br/wp-content/uploads/manual-do-mundo.mp3", true);

		xhr.responseType = 'blob';

		xhr.onload = function(e) {

		  window.requestFileSystem(TEMPORARY, 300 * 1024 * 1024, function(fs) {
		    fs.root.getFile("teste.mp3", {create: true}, function(fileEntry) {
		      fileEntry.createWriter(function(writer) {
		        writer.onwrite = function(e) { console.log('write', e); };
		        writer.onerror = function(e) { console.log('error', e); };

		        //var blob = new Blob([xhr.response], {type: 'video/mpg'});
		        var blob = new Blob([xhr.response], {type: 'audio/mpeg3'});

				writer.write(blob);
		      }, onError);
		    }, onError);
		  }, onError);
		};

		xhr.send();

  var dirReader = fs.root.createReader();
  var entries = [];

  // Call the reader.readEntries() until no more results are returned.
  var readEntries = function() {
     dirReader.readEntries (function(results) {
      	console.log(results);
      if (!results.length) {
        listResults(entries.sort());
      } else {
        entries = entries.concat(toArray(results));
        readEntries();
      }
    }, errorHandler);
  };

  

  readEntries(); // Start reading dirs.

}

var onError = function(e) {
	console.log('Write failed: ' + e.toString());
};

function createDir(rootDirEntry, folders) {
  // Throw out './' or '/' and move on to prevent something like '/foo/.//bar'.
  if (folders[0] == '.' || folders[0] == '') {
    folders = folders.slice(1);
  }
  rootDirEntry.getDirectory(folders[0], {create: true}, function(dirEntry) {
    // Recursively add the new subfolder (if we still have another to create).
    if (folders.length) {
      createDir(dirEntry, folders.slice(1));
    }
  }, errorHandler);
};


function toArray(list) {
  return Array.prototype.slice.call(list || [], 0);
}

function listResults(entries) {
  // Document fragments can improve performance since they're only appended
  // to the DOM once. Only one browser reflow occurs.
  var fragment = document.createDocumentFragment();

  entries.forEach(function(entry, i) {
	console.log(entry.toURL());
    var img = entry.isDirectory ? '<img src="folder_icon.png">' :
                                  '<img src="file_icon.png">';
    var li = document.createElement('li');
    li.innerHTML = [img, '<span>', entry.name, '</span>'].join('');
    fragment.appendChild(li);
  });

  document.querySelector('#filelist').appendChild(fragment);
}

function errorHandler(e) {
  var msg = '';

  switch (e.code) {
    case FileError.QUOTA_EXCEEDED_ERR:
      msg = 'QUOTA_EXCEEDED_ERR';
      break;
    case FileError.NOT_FOUND_ERR:
      msg = 'NOT_FOUND_ERR';
      break;
    case FileError.SECURITY_ERR:
      msg = 'SECURITY_ERR';
      break;
    case FileError.INVALID_MODIFICATION_ERR:
      msg = 'INVALID_MODIFICATION_ERR';
      break;
    case FileError.INVALID_STATE_ERR:
      msg = 'INVALID_STATE_ERR';
      break;
    default:
      msg = 'Unknown Error';
      break;
  };

  console.log('Error: ' + msg);
}

window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

if (window.requestFileSystem) {
	window.requestFileSystem(window.TEMPORARY, 5*1024*1024 /*5MB*/, onInitFs, errorHandler);
} else {
	console.log("Não tem permissão");
}
