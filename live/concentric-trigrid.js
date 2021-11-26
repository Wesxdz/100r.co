
window.addEventListener('DOMContentLoaded', (event) => {
    render_grid();
});

window.addEventListener('resize', (event) => {
    render_grid();
});


function render_grid() {

    var c = document.getElementById("spookyCanvas");
    c.width = window.innerWidth;
    c.height = 80;
    var ctx = c.getContext("2d");

    const pieSlices = 6; // fixed

    // This procedural 'concentric trigrid' was inspired by this tweet from Matthieu Dupont
    // https://mobile.twitter.com/viralata_archi/status/1106457927978795011
    // I'm planning on eventually creating this procedural pattern with a CNC machine

    // EDIT THESE VALUES! :)

    var concentricSections = 3;
    var gridRadius = 20;
    var IsInverted = (x, y) => {
    return Math.random() > 0.5;
    };
    var InvertCounterclockwise = (x, y) => {
    return Math.random() > 0.5;
    };
    var ShouldSpawnHex = (x, y) => {
    return true;
    };
    var renderTriangles = false;

    var normalColor = "#01010152";
    var invertedColor = "#01010182";
    var invertedCcwColor = "#01010152";

    var rows = c.height/gridRadius + 2;
    var cols = window.innerWidth/gridRadius;

    var viewPatternOnly = true;

    // -----

    // find the height of a given arc range
    function calcHeight(startAngle, endAngle, radius) {
    let startY = Math.cos(startAngle) * radius;
    let endY = Math.cos(endAngle) * radius;
    return endY - startY;
    }

    // orbit must be reduced to prevent circles from arcing outside of triangle
    // what is the maximum height of arc outside bounds of triangle?
    var reduce = calcHeight(0, Math.PI / pieSlices, gridRadius);

    // section radius is the distance between concentric sections, it depends on the number of concentric sections to prevent overlap
    var sectionRadius = (gridRadius + reduce) / concentricSections;

    var rads = 0;
    var radsPerSlice = (2 * Math.PI) / pieSlices;

    var width = gridRadius;
    var height = gridRadius + reduce;

    gradient = ctx.createLinearGradient(0, 0, 0, c.height);
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.5)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 1.0)");
    ctx.strokeStyle = gradient;

    function renderHex(x, y) {
    for (let s = 0; s < pieSlices; s++) {
        var inverted = IsInverted(x, y);
        var ccw = InvertCounterclockwise(x, y);

        for (let i = 0; i <= concentricSections; i++) {
        ctx.beginPath();
        let orbit =
            sectionRadius * i -
            (-reduce * (i - concentricSections)) / concentricSections;
        if (inverted) {
            if (ccw) {
            ctx.strokeStyle = invertedCcwColor;
            } else {
            ctx.strokeStyle = invertedColor;
            }
            ctx.arc(
            x + gridRadius * Math.cos(rads + ccw * radsPerSlice),
            y + gridRadius * Math.sin(rads + ccw * radsPerSlice),
            orbit,
            Math.PI + rads - radsPerSlice + ccw * radsPerSlice * 2,
            Math.PI + rads + ccw * radsPerSlice * 2
            );
        } else {
            ctx.strokeStyle = normalColor;
            ctx.arc(x, y, orbit, rads, rads + radsPerSlice);
        }
        ctx.stroke();
        }
        if (renderTriangles) {
        ctx.beginPath();
        ctx.moveTo(
            x + gridRadius * Math.cos(rads),
            y + gridRadius * Math.sin(rads)
        );
        ctx.lineTo(x, y);
        ctx.moveTo(
            x + gridRadius * Math.cos(rads),
            y + gridRadius * Math.sin(rads)
        );
        ctx.lineTo(
            x + gridRadius * Math.cos(rads + radsPerSlice),
            y + gridRadius * Math.sin(rads + radsPerSlice)
        );
        ctx.stroke();
        }
        rads += radsPerSlice;
    }
    }

    console.log("Test");
    for (let x = -1; x < cols; x++) {
        for (let y = -1; y < rows; y++) {
            if (ShouldSpawnHex(x, y)) {
            renderHex(x * width * 3 + (y % 2 === 0) * width * 1.5, y * height);
            }
        }
    }
}

window.scroll(function(){
    document.getElementByTag("body").css("opacity", 1 - window.scrollTop() / 250);
  });