let editor = ''
let stdoutTimer = null
let response = ''
// timers for php runtime
let tstart
const stdout = document.getElementById('stdout')
function showResponse() {
  stdout.srcdoc = response
  response = ''
  document.getElementById('time').innerText = (window.performance.now() - tstart) + 'ms'
}

console.time('WASM loaded')
const NUM = "number"
const STR = "string"
var Module = {
  locateFile: function(path, prefix) {
    if (path.endsWith('.data')) {
      return '/php-wasm/' + path
    }

    return prefix + path
  },
  onRuntimeInitialized: function() {
    console.timeEnd('WASM loaded')
    const ccall = Module['ccall']

    ccall('pib_init')
    execute('version.php')
  },
  onAbort: function(reason) {
    console.error(`WASM aborted: ${reason}`)
  },
  print: function(data) {
    if (!data) {
      return
    }

    response += data
    clearTimeout(stdoutTimer)
    stdoutTimer = setTimeout(() => showResponse())
  },
  printErr: function(data) {
    if (data) {
      console.log(data)
    }
  },
}

function execute() {
  const f = document.getElementById('file')
  fetch(`/php/${f.value}`, { headers: { 'Content-Type': 'application/text' } })
    .then(r => r.text())
    .then(t => {
      if (t) {
        tstart = window.performance.now()
        ccall('pib_run', NUM, [STR], [`?> ${t}`])
        editor.getModel().setValue(t)
      }
    })
}

require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.26.1/min/vs' }})
require(["vs/editor/editor.main"], () => {
  editor = monaco.editor.create(document.getElementById('editor'), {
    value: '',
    language: 'php',
    theme: 'vs-dark',
    automaticLayout: true
  })
})
