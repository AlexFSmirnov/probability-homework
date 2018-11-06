// Global variables 
b = 8;  // It's not my idea to create variables with these names,
m = 6;  // they were defined as such in the problem description.
c = 6;
n = 10;
with_return = true;
cur_balls   = [];
cur_probs   = {};
approx_on   = false;
step_num    = 1;


// Algorithm stuff
function approx_step() {
    // Some safety
    var safe = (b || m || c) && n;
    if (!with_return && n > (b + m + c)) safe = false;
    if (!safe) {
        alert("Invalid input variables!");
        if (approx_on) {
            toggle_approx();
        }
        return;
    }

    var red_picked = 0;

    // Current permutation of balls in the urn
    cur_balls = [];
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < [b, m, c][i]; j++) {
            cur_balls.push(["white", "blue", "red"][i]);
        }
    }

    for (var i = 0; i < n; i++) {
        // If no balls left, stop
        if (cur_balls.length == 0) {
            break;
        }

        // Otherwise, pick a ball
        var idx = randint(0, cur_balls.length - 1);
        var ball = cur_balls[idx];
        if (ball == "red") {
            red_picked += 1;
        }

        // Removing the ball from the urn if specified so
        if (!with_return) {
            cur_balls.splice(idx, 1);
        }
    }

    // Updating current probabilities with the found variable
    if (cur_probs[red_picked]) {
        cur_probs[red_picked] += 1;
    } else {
        cur_probs[red_picked] = 1;
    }

    // Redrawing the plot
    plot("approx-plot", 
         data_from_approx(cur_probs, step_num), 
         "Approximated probabilities");

    step_num += 1;
    if (approx_on) {
        setTimeout(approx_step, 10);
    }
}

// Returns real probabilities based on a formula
function get_real_probs() {
    real_probs = {};

    for (var i = 0; i <= n; i++) {
        if (with_return) {
            real_probs[i] = get_prob_k_return(i);
        } else {
            real_probs[i] = get_prob_k_no_return(i);
        }
    }

    return real_probs;
}

// Probability that exactly k balls were choosen
function get_prob_k_return(k) {
    return choose(n, k) * Math.pow(c / (b + m + c), k) * Math.pow((b + m) / (b + m + c), n - k);
}
function get_prob_k_no_return(k) {
    tmp_prob = 0;
    gen(n, k, []);
    return tmp_prob;
}

tmp_prob = 0;
function gen(n, k, prefix) {
    if (prefix.length == n) {
        var step_prob = 1;
        var red_met = 0;
        for (var i = 0; i < n; i++) {
            if (prefix[i] == 1) {
                step_prob *= ((c - red_met) / (b + m + c - i));
                red_met += 1;
            } else {
                step_prob *= ((b + m - (i - red_met)) / (b + m + c - i));
            }
        }
        tmp_prob += step_prob;
        return;
    }
    if (k > 0) {
        prefix.push(1);
        gen(n, k - 1, prefix);
        prefix.pop();
    } 
    if (prefix.length < n - k) {
        prefix.push(0);
        gen(n, k, prefix);
        prefix.pop();
    }
}


// Bar plots 
function plot(id, data, title) {
    var layout = {
        autosize: true,
        margin: {
            l: 30,
            r: 30,
            t: 50,
            b: 30,
        }, yaxis: {
            title: "Probability",
            titlefont: {
                color: '#aaa',
                family: 'Mina'
            },
            automargin: true
        },
        xaxis: {
            title: "#Red balls",
            titlefont: {
                color: '#aaa',
                family: 'Mina'
            },
            ticktext: [],
            tickvals: [],
            tickmode: 'array',
            automargin: true
        },
        title: title,
        titlefont: {
            color: '#aaa',
            family: 'Mina'
        },
        paper_bgcolor: "#111",
        plot_bgcolor: "#111"
    };

    for (var i = 0; i <= n; i++) {
        layout.xaxis.ticktext.push(i);
        layout.xaxis.tickvals.push(i);
    }

    Plotly.newPlot(id, data, layout);
}

function data_from_approx(probs, steps) {
    // Specific data format for Plotly
    var data = [{x: [], 
                 y: [],
                 marker: {color: []},
                 type: 'bar'}];

    for (var i = 0; i <= n; i++) {
        data[0].x.push(i);
        data[0].y.push(probs[i] / steps);
        data[0].marker.color.push("#ffa500");
    }

    return data;
}

function data_from_real(probs) {
    var data = [{x: [], 
                 y: [],
                 marker: {color: []},
                 type: 'bar'}];

    for (var i = 0; i <= n; i++) {
        data[0].x.push(i);
        data[0].y.push(probs[i]);
        data[0].marker.color.push("cyan");
    }

    return data;
}

// JS stuff
function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function factorial(n) {
    if (n == 0) {
        return 1;
    } 
    return n * factorial(n - 1);
}

function choose(n, k) {
    if (k > n) return 0;
    return factorial(n) / (factorial(k) * factorial(n - k));
}

function setup() {
    var main    = document.getElementsByClassName("main")[0];
    var sidebar = document.getElementsByClassName("sidenav")[0];
    var plots   = document.getElementsByClassName("plot");

    // Setting the main margin to that content doesn't overlap with the sidebar 
    main.style.marginLeft = sidebar.offsetWidth + "px";

    // Setting the plot layout width and height
    var side = (sidebar.offsetHeight - 50) / 2 + "px";
    for (var i = 0; i < 2; i++) {
        plots[i].style.width = side;
        plots[i].style.height = side;
    }
    plots[0].style.marginBottom = "10px";

    // Writing default values 
    for (var i = 0; i < 4; i++) {
        document.getElementById("bmcn"[i]).value = [b, m, c, n][i];
    }
    update_globals();

    // Tracking changes of input values 
    for (var i = 0; i < 4; i++) {
        document.getElementById("bmcn"[i]).addEventListener("input", update_globals);
    }
    document.getElementById("with-returning").addEventListener("change", update_globals);

    // Event listeners for button presses 
    document.getElementById("pick").onclick = approx_step;
    document.getElementById("start").onclick = toggle_approx;
    document.getElementById("reset").onclick = update_globals;
}

function toggle_approx() {
    var btn = document.getElementById("start");
    approx_on = !approx_on;
    if (approx_on) {
        btn.innerHTML = "Stop random approximation";
        approx_step();
    } else {
        btn.innerHTML = "Start random approximation";
    }
}

function update_globals() {
    b = parseInt(document.getElementById("b").value);
    m = parseInt(document.getElementById("m").value);
    c = parseInt(document.getElementById("c").value);
    n = parseInt(document.getElementById("n").value);
    with_return = document.getElementById("with-returning").checked;

    cur_probs = {};
    for (var i = 0; i <= n; i++) {
        cur_probs[i] = 0;
    }

    plot("approx-plot", data_from_approx(cur_probs, 1), "Approximated probabilities");
    plot("real-plot", data_from_real(get_real_probs()), "Real probabilities");

    if (approx_on) {
        toggle_approx();
    }
    step_num = 1;
}

