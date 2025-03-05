$(document).ready(function() {
    $('#upload-form').on('submit', function(event) {
        event.preventDefault();
        var formData = new FormData();
        formData.append('file', $('#csv-file')[0].files[0]);

        $.ajax({
            url: '/upload',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function() {
                window.location.href = '/dashboard';
            }
        });
    });

    $('#auto-upload-form').on('submit', function(event) {
        event.preventDefault();
        var formData = new FormData();
        formData.append('file', $('#auto-csv-file')[0].files[0]);

        $.ajax({
            url: '/upload',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function() {
                window.location.href = '/dashboard';
            }
        });
    });

    // Select last uploaded file
    $('#load-last-uploaded').on('click', function() {
        var lastFile = $('#file-select option:last').val();
        if (lastFile) {
            $('#file-select').val(lastFile);
            $('#load-insights').click();
        }
    });

    if (window.location.pathname === '/dashboard') {
        $('#overlay').show(); // Show overlay
        $('#preloader').show(); // Show preloader
        $.ajax({
            url: '/file-insights',
            type: 'POST',
            contentType: 'application/json', // Set content type to application/json
            data: JSON.stringify({ filename: $('#file-select').val() }), // Send data as JSON
            success: function(data) {
                $('#overlay').hide(); // Hide overlay
                $('#preloader').hide(); // Hide preloader
                displayCSVPreview(data.columns, data.rows);
                displayFileInsights(data.insights);
            },
            error: function() {
                $('#overlay').hide(); // Hide overlay on error
                $('#preloader').hide(); // Hide preloader on error
            }
        });
    }

    $('#toggle-sidebar').on('click', function() {
        $('.sidebar').toggleClass('hidden');
    });

    $('#load-insights').on('click', function() {
        var selectedFile = $('#file-select').val();
        if (selectedFile) {
            $('#overlay').show(); // Show overlay
            $('#preloader').show(); // Show preloader
            $.ajax({
                url: '/file-insights',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ filename: selectedFile }),
                success: function(data) {
                    $('#overlay').hide(); // Hide overlay
                    $('#preloader').hide(); // Hide preloader
                    displayCSVPreview(data.columns, data.rows);
                    displayFileInsights(data.insights);
                },
                error: function() {
                    $('#overlay').hide(); // Hide overlay on error
                    $('#preloader').hide(); // Hide preloader on error
                }
            });
        }
    });
});

function displayCSVPreview(columns, rows) {
    var thead = $('#csv-preview-header');
    var tbody = $('#csv-preview-body');
    
    thead.empty();
    tbody.empty();
    
    var headerRow = columns.map(col => `<th>${col}</th>`).join('');
    thead.append(headerRow);
    
    rows.forEach(row => {
        var rowHtml = '<tr>' + row.map(cell => `<td>${cell}</td>`).join('') + '</tr>';
        tbody.append(rowHtml);
    });
}

function displayFileInsights(insights) {
    var insightsCards = $('#insights-cards');
    insightsCards.empty();
    
    for (var key in insights) {
        if (insights.hasOwnProperty(key)) {
            var cardHtml = `<div class="card">
                                <h5>${key.replace(/_/g, ' ')}</h5>
                                <p>${formatInsightContent(insights[key])}</p>
                            </div>`;
            insightsCards.append(cardHtml);
        }
    }
}

function formatInsightContent(insight) {
    if (typeof insight === 'object') {
        return `<ul>${Object.entries(insight).map(([subKey, value]) => `<li><strong>${subKey}:</strong> ${value}</li>`).join('')}</ul>`;
    } else {
        return insight;
    }
}