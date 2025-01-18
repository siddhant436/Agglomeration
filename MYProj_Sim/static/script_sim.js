$(document).ready(function () {
    let currentStep = 0;
    let attackData = null;
    let attackType = ''; // Track current attack type (MITM, Replay, DoS)
    let isQuizShown = false; // Prevent showing quiz more than once

    // Initially hide attack results and buttons
    $('#attackResults').hide();
    $('#nextStepBtn').hide();
    $('#prevStepBtn').hide();

    // Handle MITM Attack Button Click
    $('#mitmBtn').click(function () {
        resetSimulation();
        attackType = 'mitm';  // Set attack type to MITM
        $.get('/mitm_attack', function (data) {
            attackData = data;
            $('#attackTitle').text(data.attack);
            $('#attackDetails').html(`
                <p><strong>Flaw:</strong> This attack targets vulnerabilities in key exchange and certificate validation.</p>
                <p><strong>Learning Goal:</strong> Understand how attackers can intercept and alter secure communications.</p>
            `);
            showStep();
            $('#attackResults').show();
            $('#nextStepBtn').show();
            $('#mitmExample').show();
        });
    });

    // Handle Replay Attack Button Click
    $('#replayBtn').click(function () {
        resetSimulation();
        attackType = 'replay';  // Set attack type to Replay
        $.get('/replay_attack', function (data) {
            attackData = data;
            $('#attackTitle').text(data.attack);
            $('#attackDetails').html(`
                <p><strong>Flaw:</strong> This attack exploits poorly implemented session key handling, allowing old messages to be replayed.</p>
                <p><strong>Learning Goal:</strong> Understand how session management issues can lead to security breaches.</p>
            `);
            showStep();
            $('#attackResults').show();
            $('#nextStepBtn').show();
            $('#replayExample').show();
        });
    });

    // Handle DoS Attack Button Click
    $('#dosBtn').click(function () {
        resetSimulation();
        attackType = 'dos';  // Set attack type to DoS
        $.get('/dos_attack', function (data) {
            attackData = data;
            $('#attackTitle').text(data.attack);
            $('#attackDetails').html(`
                <p><strong>Flaw:</strong> This attack involves overwhelming a server with excessive requests to cause a denial of service.</p>
                <p><strong>Learning Goal:</strong> Understand the impact of DoS attacks and how they disrupt services.</p>
            `);
            showStep();
            $('#attackResults').show();
            $('#nextStepBtn').show();
            $('#dosExample').show();
        });
    });

    // Show next attack step
    $('#nextStepBtn').click(function () {
        if (currentStep < attackData.steps.length - 1) {
            currentStep++;
            showStep();
            $('#prevStepBtn').show();
        } else {
            // Show quiz when all steps are completed
            if (!isQuizShown) {
                isQuizShown = true;
                if (attackType === 'mitm') {
                    $('#mitmQuizModal').modal('show');
                } else if (attackType === 'replay') {
                    $('#replayQuizModal').modal('show');
                } else if (attackType === 'dos') {
                    $('#dosQuizModal').modal('show');
                }
            }
        }
    });

    // Show previous attack step
    $('#prevStepBtn').click(function () {
        if (currentStep > 0) {
            currentStep--;
            showStep();
        }
    });

    // Function to update step content
    function showStep() {
        $('#attackSteps').html(`
            <h4>Step ${currentStep + 1}: ${attackData.steps[currentStep].title}</h4>
            <p>${attackData.steps[currentStep].description}</p>
        `);
    }

    // Reset simulation state
    function resetSimulation() {
        currentStep = 0;
        attackData = null;
        $('#attackResults').hide();
        $('#nextStepBtn').show();
        $('#prevStepBtn').hide();
        isQuizShown = false;
        $('#mitmExample').hide();
        $('#replayExample').hide();
        $('#dosExample').hide();
    }

    // Handle quiz form submission for MITM attack
    $('#mitmQuizForm').submit(function (event) {
        event.preventDefault();
        let score = 0;

        // Check the answers and calculate the score
        $('input[type="radio"]:checked').each(function () {
            score += parseInt($(this).val());
        });

        // Display score in modal
        $('#mitmScore').text(score);
        $('#mitmQuizScore').show();

        // Disable form after submission
        $('#mitmQuizForm input').prop('disabled', true);

        setTimeout(function () {
            $('#mitmQuizModal').modal('hide');
        }, 3000);
    });

    // Handle quiz form submission for Replay attack
    $('#replayQuizForm').submit(function (event) {
        event.preventDefault();
        let score = 0;

        $('input[type="radio"]:checked').each(function () {
            score += parseInt($(this).val());
        });

        $('#replayScore').text(score);
        $('#replayQuizScore').show();

        $('#replayQuizForm input').prop('disabled', true);

        setTimeout(function () {
            $('#replayQuizModal').modal('hide');
        }, 3000);
    });

    // Handle quiz form submission for DoS attack
    $('#dosQuizForm').submit(function (event) {
        event.preventDefault();
        let score = 0;

        $('input[type="radio"]:checked').each(function () {
            score += parseInt($(this).val());
        });

        $('#dosScore').text(score);
        $('#dosQuizScore').show();

        $('#dosQuizForm input').prop('disabled', true);

        setTimeout(function () {
            $('#dosQuizModal').modal('hide');
        }, 3000);
    });
});
