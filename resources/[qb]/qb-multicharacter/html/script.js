var selectedChar = null;
var WelcomePercentage = "30vh"
qbMultiCharacters = {}
var Loaded = false;

$(document).ready(function() {
    window.addEventListener('message', function(event) {
        var data = event.data;

        if (data.action == "ui") {
            if (data.toggle) {
                $('.container').show();
                $(".welcomescreen").fadeIn(150);
                qbMultiCharacters.resetAll();

                var originalText = "Recuperando los datos del jugador";
                var loadingProgress = 0;
                var loadingDots = 0;
                $("#loading-text").html(originalText);
                var DotsInterval = setInterval(function() {
                    $("#loading-text").append(".");
                    loadingDots++;
                    loadingProgress++;
                    if (loadingProgress == 3) {
                        originalText = "Validando datos del jugador"
                        $("#loading-text").html(originalText);
                    }
                    if (loadingProgress == 4) {
                        originalText = "Recuperando personajes"
                        $("#loading-text").html(originalText);
                    }
                    if (loadingProgress == 6) {
                        originalText = "Validando Personajes"
                        $("#loading-text").html(originalText);
                    }
                    if (loadingDots == 4) {
                        $("#loading-text").html(originalText);
                        loadingDots = 0;
                    }
                }, 500);

                setTimeout(function() {
                    $.post('https://qb-multicharacter/setupCharacters');
                    setTimeout(function() {
                        clearInterval(DotsInterval);
                        loadingProgress = 0;
                        originalText = "Retrieving data";
                        $(".welcomescreen").fadeOut(150);
                        qbMultiCharacters.fadeInDown('.character-info', '20%', 400);
                        qbMultiCharacters.fadeInDown('.characters-list', '20%', 400);
                        $.post('https://qb-multicharacter/removeBlur');
                    }, 2000);
                }, 2000);
            } else {
                $('.container').fadeOut(250);
                qbMultiCharacters.resetAll();
            }
        }

        if (data.action == "setupCharacters") {
            setupCharacters(event.data.characters)
        }

        if (data.action == "setupCharInfo") {
            setupCharInfo(event.data.chardata)
        }
    });

    $('.datepicker').datepicker();
});

$('.continue-btn').click(function(e) {
    e.preventDefault();

    // qbMultiCharacters.fadeOutUp('.welcomescreen', undefined, 400);
    // qbMultiCharacters.fadeOutDown('.server-log', undefined, 400);
    // setTimeout(function(){
    //     qbMultiCharacters.fadeInDown('.characters-list', '20%', 400);
    //     qbMultiCharacters.fadeInDown('.character-info', '20%', 400);
    //     $.post('https://qb-multicharacter/setupCharacters');
    // }, 400)
});

$('.disconnect-btn').click(function(e) {
    e.preventDefault();

    $.post('https://qb-multicharacter/closeUI');
    $.post('https://qb-multicharacter/disconnectButton');
});

function setupCharInfo(cData) {
    if (cData == 'empty') {
        $('.character-info-valid').html('<span id="no-char">El espacio de caracteres seleccionada aún no está en uso.<br><br>Este personaje aún no tiene información.</span>');
    } else {
        var gender = "Hombre"
        if (cData.charinfo.gender == 1) { gender = "Mujer" }
        $('.character-info-valid').html(
            '<div class="character-info-box"><span id="info-label">Nombre: </span><span class="char-info-js">' + cData.charinfo.firstname + ' ' + cData.charinfo.lastname + '</span></div>' +
            '<div class="character-info-box"><span id="info-label">Fecha de nacimiento: </span><span class="char-info-js">' + cData.charinfo.birthdate + '</span></div>' +
            '<div class="character-info-box"><span id="info-label">Género: </span><span class="char-info-js">' + gender + '</span></div>' +
            '<div class="character-info-box"><span id="info-label">Nacionlidad: </span><span class="char-info-js">' + cData.charinfo.nationality + '</span></div>' +
            '<div class="character-info-box"><span id="info-label">Trabajo: </span><span class="char-info-js">' + cData.job.label + '</span></div>' +
            '<div class="character-info-box"><span id="info-label">Cartera: </span><span class="char-info-js">&#36; ' + cData.money.cash + '</span></div>' +
            '<div class="character-info-box"><span id="info-label">Banco: </span><span class="char-info-js">&#36; ' + cData.money.bank + '</span></div>' +
            '<div class="character-info-box"><span id="info-label">Numero de Teléfono: </span><span class="char-info-js">' + cData.charinfo.phone + '</span></div>' +
            '<div class="character-info-box"><span id="info-label">Numero de cuenta: </span><span class="char-info-js">' + cData.charinfo.account + '</span></div>');
    }
}

function setupCharacters(characters) {
    $.each(characters, function(index, char) {
        $('#char-' + char.cid).html("");
        $('#char-' + char.cid).data("citizenid", char.citizenid);
        setTimeout(function() {
            $('#char-' + char.cid).html('<span id="slot-name">' + char.charinfo.firstname + ' ' + char.charinfo.lastname + '<span id="cid">' + char.citizenid + '</span></span>');
            $('#char-' + char.cid).data('cData', char)
            $('#char-' + char.cid).data('cid', char.cid)
        }, 100)
    })
}

$(document).on('click', '#close-log', function(e) {
    e.preventDefault();
    selectedLog = null;
    $('.welcomescreen').css("filter", "none");
    $('.server-log').css("filter", "none");
    $('.server-log-info').fadeOut(250);
    logOpen = false;
});

$(document).on('click', '.character', function(e) {
    var cDataPed = $(this).data('cData');
    e.preventDefault();
    if (selectedChar === null) {
        selectedChar = $(this);
        if ((selectedChar).data('cid') == "") {
            $(selectedChar).addClass("char-selected");
            setupCharInfo('empty')
            $("#play-text").html("Crear");
            $("#play").css({ "display": "block" });
            $("#delete").css({ "display": "none" });
            $.post('https://qb-multicharacter/cDataPed', JSON.stringify({
                cData: cDataPed
            }));
        } else {
            $(selectedChar).addClass("char-selected");
            setupCharInfo($(this).data('cData'))
            $("#play-text").html("Entrar");
            $("#delete-text").html("Borrar");
            $("#play").css({ "display": "block" });
            $("#delete").css({ "display": "block" });
            $.post('https://qb-multicharacter/cDataPed', JSON.stringify({
                cData: cDataPed
            }));
        }
    } else if ($(selectedChar).attr('id') !== $(this).attr('id')) {
        $(selectedChar).removeClass("char-selected");
        selectedChar = $(this);
        if ((selectedChar).data('cid') == "") {
            $(selectedChar).addClass("char-selected");
            setupCharInfo('empty')
            $("#play-text").html("Registrarse");
            $("#play").css({ "display": "block" });
            $("#delete").css({ "display": "none" });
            $.post('https://qb-multicharacter/cDataPed', JSON.stringify({
                cData: cDataPed
            }));
        } else {
            $(selectedChar).addClass("char-selected");
            setupCharInfo($(this).data('cData'))
            $("#play-text").html("Entrar");
            $("#delete-text").html("Borrar");
            $("#play").css({ "display": "block" });
            $("#delete").css({ "display": "block" });
            $.post('https://qb-multicharacter/cDataPed', JSON.stringify({
                cData: cDataPed
            }));
        }
    }
});

var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '': '&#x60;',
    '=': '&#x3D;'
};

function escapeHtml(string) {
    return String(string).replace(/[&<>"'=/]/g, function(s) {
        return entityMap[s];
    });
}

function hasWhiteSpace(s) {
    return /\s/g.test(s);
}
$(document).on('click', '#create', function(e) {
    e.preventDefault();

    let firstname = escapeHtml($('#first_name').val())
    let lastname = escapeHtml($('#last_name').val())
    let nationality = escapeHtml($('#nationality').val())
    let birthdate = escapeHtml($('#birthdate').val())
    let gender = escapeHtml($('select[name=gender]').val())
    let cid = escapeHtml($(selectedChar).attr('id').replace('char-', ''))

    //An Ugly check of null objects

    if (!firstname || !lastname || !nationality || !birthdate || hasWhiteSpace(firstname) || hasWhiteSpace(lastname) || hasWhiteSpace(nationality)) {
        console.log("FIELDS REQUIRED")
    } else {
        $.post('https://qb-multicharacter/createNewCharacter', JSON.stringify({
            firstname: firstname,
            lastname: lastname,
            nationality: nationality,
            birthdate: birthdate,
            gender: gender,
            cid: cid,
        }));
        $(".container").fadeOut(150);
        $('.characters-list').css("filter", "none");
        $('.character-info').css("filter", "none");
        qbMultiCharacters.fadeOutDown('.character-register', '125%', 400);
        refreshCharacters()
    }
});
// $(document).on('click', '#create', function(e){
//     e.preventDefault();
//     $.post('https://qb-multicharacter/createNewCharacter', JSON.stringify({
//         firstname: $('#first_name').val(),
//         lastname: $('#last_name').val(),
//         nationality: $('#nationality').val(),
//         birthdate: $('#birthdate').val(),
//         gender: $('select[name=gender]').val(),
//         cid: $(selectedChar).attr('id').replace('char-', ''),
//     }));
//     $(".container").fadeOut(150);
//     $('.characters-list').css("filter", "none");
//     $('.character-info').css("filter", "none");
//     qbMultiCharacters.fadeOutDown('.character-register', '125%', 400);
//     refreshCharacters()
// });

$(document).on('click', '#accept-delete', function(e) {
    $.post('https://qb-multicharacter/removeCharacter', JSON.stringify({
        citizenid: $(selectedChar).data("citizenid"),
    }));
    $('.character-delete').fadeOut(150);
    $('.characters-block').css("filter", "none");
    refreshCharacters()
});

function refreshCharacters() {
    $('.characters-list').html('<div class="character" id="char-1" data-cid=""><span id="slot-name">Crear Personaje<span id="cid"></span></span></div><div class="character" id="char-2" data-cid=""><span id="slot-name">Crear Personaje<span id="cid"></span></span></div><div class="character" id="char-3" data-cid=""><span id="slot-name">Crear Personaje<span id="cid"></span></span></div><div class="character" id="char-4" data-cid=""><span id="slot-name">Crear Personaje<span id="cid"></span></span></div><div class="character" id="char-5" data-cid=""><span id="slot-name">Crear Personaje<span id="cid"></span></span></div><div class="character-btn" id="play"><p id="play-text">Select a character</p></div><div class="character-btn" id="delete"><p id="delete-text">Select a character</p></div>')
    setTimeout(function() {
        $(selectedChar).removeClass("char-selected");
        selectedChar = null;
        $.post('https://qb-multicharacter/setupCharacters');
        $("#delete").css({ "display": "none" });
        $("#play").css({ "display": "none" });
        qbMultiCharacters.resetAll();
    }, 100)
}

$("#close-reg").click(function(e) {
    e.preventDefault();
    $('.characters-list').css("filter", "none")
    $('.character-info').css("filter", "none")
    qbMultiCharacters.fadeOutDown('.character-register', '125%', 400);
})

$("#close-del").click(function(e) {
    e.preventDefault();
    $('.characters-block').css("filter", "none");
    $('.character-delete').fadeOut(150);
})

$(document).on('click', '#play', function(e) {
    e.preventDefault();
    var charData = $(selectedChar).data('cid');

    if (selectedChar !== null) {
        if (charData !== "") {
            $.post('https://qb-multicharacter/selectCharacter', JSON.stringify({
                cData: $(selectedChar).data('cData')
            }));
            // qbMultiCharacters.fadeInDown('.welcomescreen', WelcomePercentage, 400);
            // qbMultiCharacters.fadeInDown('.server-log', '25%', 400);
            setTimeout(function() {
                qbMultiCharacters.fadeOutDown('.characters-list', "-40%", 400);
                qbMultiCharacters.fadeOutDown('.character-info', "-40%", 400);
                qbMultiCharacters.resetAll();
            }, 1500);
        } else {
            $('.characters-list').css("filter", "blur(2px)")
            $('.character-info').css("filter", "blur(2px)")
            qbMultiCharacters.fadeInDown('.character-register', '25%', 400);
        }
    }
});

$(document).on('click', '#delete', function(e) {
    e.preventDefault();
    var charData = $(selectedChar).data('cid');

    if (selectedChar !== null) {
        if (charData !== "") {
            $('.characters-block').css("filter", "blur(2px)")
            $('.character-delete').fadeIn(250);
        }
    }
});

qbMultiCharacters.fadeOutUp = function(element, time) {
    $(element).css({ "display": "block" }).animate({ top: "-80.5%", }, time, function() {
        $(element).css({ "display": "none" });
    });
}

qbMultiCharacters.fadeOutDown = function(element, percent, time) {
    if (percent !== undefined) {
        $(element).css({ "display": "block" }).animate({ top: percent, }, time, function() {
            $(element).css({ "display": "none" });
        });
    } else {
        $(element).css({ "display": "block" }).animate({ top: "103.5%", }, time, function() {
            $(element).css({ "display": "none" });
        });
    }
}

qbMultiCharacters.fadeInDown = function(element, percent, time) {
    $(element).css({ "display": "block" }).animate({ top: percent, }, time);
}

qbMultiCharacters.resetAll = function() {
    $('.characters-list').hide();
    $('.characters-list').css("top", "-40");
    $('.character-info').hide();
    $('.character-info').css("top", "-40");
    // $('.welcomescreen').show();
    $('.welcomescreen').css("top", WelcomePercentage);
    $('.server-log').show();
    $('.server-log').css("top", "25%");
}