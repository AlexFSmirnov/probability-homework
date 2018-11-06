// Global variables 
b = 8;  // It's not my idea to create variables with these names,
m = 6;  // they were defined as such in the problem description.
c = 6;
n = 10;
with_return = true;
cur_balls   = [];
cur_probs   = {};
approx_on   = false;
step_num    = 0;


// Algorithm stuff
function approx_step() {
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


    step_num += 1;
    if (approx_on) {
        setTimeout(approx_step, 10);
    }
}


// JS stuff
function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function setup() {
    var main    = document.getElementsByClassName("main")[0];
    var sidebar = document.getElementsByClassName("sidenav")[0];

    // Setting the main margin to that content doesn't overlap with the sidebar 
    main.style.marginLeft = sidebar.offsetWidth + "px";

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
        if (!b || !m || !c || !n) {
            alert("Invalid input values!");
            return;
        }

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

    // When we know the balls are not returned to the urn,
    // predefine all possible probabilities as zeros. Otherwise, we
    // can get any result, so the probabilities will be counted later.
    cur_probs = {};
    if (!with_return) {
        for (var i = 0; i <= c; i++) {
            cur_probs[i] = 0;
        }
    }

    approx_on = false;
    step_num = 0;
}

