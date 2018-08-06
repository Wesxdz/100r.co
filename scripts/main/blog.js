function Blog()
{
  this.el = document.createElement('div');
  this.el.id = "blog";
  this.el.className = "loading";

  this.el.appendChild(this.hd = document.createElement('div')); this.hd.id = "hd";
  this.el.appendChild(this.sb = document.createElement('div')); this.sb.id = "sb";
  this.el.appendChild(this.md = document.createElement('div')); this.md.id = "md";
  this.el.appendChild(this.fd = document.createElement('div')); this.fd.id = "fd";

  this.tables = {blog:db_blog,knowledge:db_knowledge,pages:db_pages}

  this.install = function(host)
  {
    host.appendChild(this.el);
  }

  this.bang = function()
  {
    this.hd.innerHTML = "<a href='index.html'><img src='media/interface/logo.svg'/></a>";
    this.sb.innerHTML = this._sidebar();

    var target = window.location.hash.replace("#","").replace(/\_/g," ").replace(/\+/g," ").trim();
    var blogs = Object.keys(this.tables.blog)
    var latest_blog = blogs[0];

    this.load(target ? target : latest_blog);
  }

  this.load = function(target)
  {
    var result = this.find(target);

    if(!result){ this.missing(target); return; }

    var entry = this.tables[result.id][result.name];
    window.location.hash = `${result.name.to_url()}`

    this.el.className = "loading";
    this.update(result,entry);

    this.show();
  }

  this.find = function(target)
  {
    for(id in this.tables){
      var table = this.tables[id]
      for(name in table){
        var category = table[name];
        if(target.to_path() == name.to_path()){
          return {id:id,name:name};
        }
      }
    }
    // Deep lookup
    console.log("Deep blog lookup",target)
    for(id in this.tables.blog){
      var blog = this.tables.blog[id]
      if(blog.LOCATION.toLowerCase().indexOf(target.toLowerCase()) < 0){ continue; }
      return {id:"blog",name:id}
    }
  
    return null;
  }

  this.update = function(result,entry)
  {
    var html = `<h1>${result.name.capitalize()}</h1>`

    for(id in entry){
      var field = entry[id];
      html += `<h2 class='${id.toLowerCase()}'>${id.capitalize()}</h2>`
      html += `<div class='${id.toLowerCase()}'>${Array.isArray(field) ? new Runic(field).parse() : field}</div>`
    }

    this.sb.innerHTML = this._sidebar(result);

    this.md.innerHTML = `<article>${html}</article>`;
  }

  this.missing = function(target)
  {
    var html = `<h1>404</h1>`
    html += `<h2>Could not find "${target}".</h2><p>If you think this to be an error, <br/>please contact {{@hundredrabbits|http://twitter.com/hundredrabbits}}.</p>`;
    this.md.innerHTML = html.to_markup();

    this.show();
  }

  this.show = function(delay = 200)
  {
    setTimeout(()=>{ 
      this.el.className = "ready"; 
      window.scrollTo(0,0); 
    },delay)
  }

  this._sidebar = function(result = {id:'',name:''})
  {
    var html = "";

    for(id in this.tables){
      var table = this.tables[id]
      html += `<list class='table'>`
      html += `<ln class='head ${result.id.to_path() == id.to_path() ? 'selected' : ''}'>${id.capitalize()}</ln>`
      for(name in table){
        var category = table[name];
        html += `<ln class='${result.name.to_path() == name.to_path() ? 'selected' : ''}'>{{${name.capitalize()}}}</ln>`.to_markup()
      }
      html += '</list>'
    }
    return html;
  }

  this._diaries = function()
  {
    return ""
    var html = "";
    for(name in db_blog){
      var topics = db_blog[name];
      for(id in topics){
        var entry = topics[id];
        html += `
        <div class='content'>
          <h2 id='${id.to_path()}'>${id}</h2>
          <h3>${entry.LOCATION} — ${entry.DATE}</h3>
          ${new Runic(entry.TEXT)}
        </div>`
      }
    }
    return html;
  }

  this.build = function()
  {
    return `${this._sidebar()}`
  }
}

var detectBackOrForward = function(onBack, onForward)
{
  hashHistory = [window.location.hash];
  historyLength = window.history.length;

  return function()
  {
    var hash = window.location.hash, length = window.history.length;
    if (hashHistory.length && historyLength == length) {
      if (hashHistory[hashHistory.length - 2] == hash) {
        hashHistory = hashHistory.slice(0, -1);
        onBack();
      } else {
        hashHistory.push(hash);
        onForward();
      }
    } else {
      hashHistory.push(hash);
      historyLength = length;
    }
  }
};

window.addEventListener("hashchange", detectBackOrForward(
  function() { console.log("back"); app.bang() },
  function() { console.log("forward"); app.bang() }
));