app.initialized().then(function (client) {
    window.client = client;
    $(".next_page").hide();
    $(document).on('click', '#authBtn', function () {
        $(this).text("Authenticating...");
        $(this).prop("disabled", true);
        ($("#apiKey").val().trim() === "") ?
            showErrorMsg("apiKey", "Please enter API Key") :
            removeAttrFn("apiKey");
        ($("#domain").val().trim() === "") ? showErrorMsg("domain", "Please enter Domain") : removeAttrFn("domain");
        ($("#apiKey").val().trim() !== "" && $("#domain").val().trim() !== "") ? getTicketFileds() : buttonEnable();
    });
    $(document).on('change', '#customerID', function () {
        $("#selectError").html("");
    });
    $(document).on('fwChange', '#domain,#apiKey,#cargo_url,#cargoApiKey', function () {
        removeAttrFn("domain");
        removeAttrFn("apiKey");
        $(".error_div,#selectError").html("");
        buttonEnable();
    });
});
function removeAttrFn(id) {
    $("#" + id).removeAttr("state-text");
    $("#" + id).removeAttr("state");
}
function showErrorMsg(id, text) {
    $("#" + id).attr("state-text", text);
    $("#" + id).attr("state", "error");
}
function getTicketFileds() {
    var domain = $("#domain").val();
    var api_key = $("#apiKey").val();
    var headers = { "Authorization": "Basic " + btoa(api_key) };
    var options = { headers: headers };

    var url = `https://${domain}/api/v2/ticket_fields`;
    console.log(url)
    console.log(options)
    console.log(api_key)
    client.request.get(url, options).then(function (data) {
        $("#authBtn").text("Authenticated");
        $(".authentication").hide();
        $(".next_page").show();
        try {
            var resp = JSON.parse(data.response);
            console.log(resp)
            var select = `<option disabled="disabled" selected>--Select--</option>`;
            $.each(resp, function (k, v) {
                console.log(v.type)
                if (v.default === false && v.type === "custom_number") {
                    select +=
                        `<option value="${v.name}">${v.label}</option>")`;
                }
            });
            select = `${select}</select>`;

            $('#customerID').append(select);

            if (updateConfigs !== undefined) {
                $("#customerID").val(updateConfigs.customerID);
            }

        } catch (error) {
            console.log(error)
        }
    }, function (error) {
        console.log(error)
        handleError(error);
    });

}
function buttonEnable() {
    $("#authBtn").text("Authenticate");
    $("#authBtn").prop("disabled", false);
}
function handleError(error) {
    $('.error_div').show();
    if (error.status === 400) {
        $('.error_div').html("Invalid Input entered, please verify the fields and try again.");
    } else if (error.status === 401 || error.status === 403) {
        $('.error_div').html("Invalid Credentials were given or Subscription to the service expired.");
    } else if (error.status === 404) {
        $('.error_div').html("Invalid Domain entered, please check the field and try again");
    } else if (error.status === 500) {
        $('.error_div').html("Unexpected error occurred, please try after sometime.");
    } else if (error.status === 502) {
        $('.error_div').html("Error in establishing a connection.");
    } else if (error.status === 504) {
        $('.error_div').html("Timeout error while processing the request.");
    } else {
        $('.error_div').html("Unexpected Error");
    }
}