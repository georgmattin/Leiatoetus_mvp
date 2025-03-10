from send_email import send_email
from datetime import datetime

def send_notifications_activated_email(user_email, company_name, subscription_data):
    """
    Saadab e-kirja kinnitamaks, et kasutaja on aktiveerinud teavitused
    """
    
    # Vormindame kuupäeva
    start_date = datetime.strptime(subscription_data['start_date'], "%Y-%m-%d").strftime("%d.%m.%Y")
    
    html_content = f"""
    <!DOCTYPE html>
    <html lang="et">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Teavitused Aktiveeritud</title>
    </head>
    <body style="margin: 0; padding: 0; min-width: 100%; background-color: #ffffff;">
        <center style="width: 100%; table-layout: fixed; background-color: #ffffff; padding: 40px 0;">
            <div style="max-width: 600px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 4px; margin: 0 auto;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; font-family: 'Inter', Arial, sans-serif;">
                    <!-- Header Section -->
                    <tr>
                        <td style="padding: 40px 30px; background-color: #f8fafc; border-bottom: 1px solid #e5e7eb;">
                            <h1 style="margin: 0 0 20px 0; font-size: 24px; line-height: 32px; font-weight: 600; color: #111827;">
                                Teavitused on aktiveeritud!
                            </h1>
                            <p style="margin: 0; color: #4b5563; font-size: 16px; line-height: 24px;">
                                Olete edukalt aktiveerinud teavitused ettevõttele <strong style="color: #111827;">{company_name}</strong>
                            </p>
                        </td>
                    </tr>

                    <!-- Info Section -->
                    <tr>
                        <td style="padding: 30px;">
                            <div style="background-color: #f8fafc; border: 1px solid #e5e7eb; border-radius: 4px; padding: 20px; margin-bottom: 20px;">
                                <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #111827;">Teie tellimuse info</h2>
                                <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
                                    <tr>
                                        <td style="padding: 8px 0; color: #4b5563; font-size: 15px;">Tellimuse algus:</td>
                                        <td style="padding: 8px 0; color: #111827; font-size: 15px; font-weight: 500; text-align: right;">
                                            {start_date}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #4b5563; font-size: 15px;">Hind:</td>
                                        <td style="padding: 8px 0; color: #111827; font-size: 15px; font-weight: 500; text-align: right;">
                                            14.99€ / {subscription_data['billing_period']}
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <div style="background-color: #f8fafc; border: 1px solid #e5e7eb; border-radius: 4px; padding: 20px; margin-bottom: 20px;">
                                <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #111827;">Mida see tähendab?</h2>
                                <ul style="margin: 0; padding: 0 0 0 20px; color: #4b5563; font-size: 15px; line-height: 24px;">
                                    <li style="margin-bottom: 8px;">Teavitame teid koheselt, kui leiame teie ettevõttele sobivaid toetusi</li>
                                    <li style="margin-bottom: 8px;">Saate infot lähenevate tähtaegade kohta</li>
                                    <li style="margin-bottom: 8px;">Hoiame teid kursis oluliste muudatustega toetuste tingimustes</li>
                                    <li>Saate personaalseid soovitusi toetuste taotlemiseks</li>
                                </ul>
                            </div>

                            <p style="color: #4b5563; font-size: 15px; line-height: 24px; margin: 0;">
                                Teavitused saadetakse teie e-posti aadressile. Saate igal ajal oma teavituste seadeid muuta 
                                <a href="https://www.leiatoetus.ee/account/settings" style="color: #2563eb; text-decoration: none;">LeiaToetus.ee portaalis</a>.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer Section -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="padding: 20px 0 0 0; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; line-height: 21px;">
                                        <p style="margin: 0 0 15px 0;">
                                            Parimate soovidega,<br>
                                            <strong style="color: #111827;">LeiaToetus.ee meeskond</strong>
                                        </p>
                                        <p style="margin: 0 0 10px 0;">
                                            <a href="mailto:info@leiatoetus.ee" style="color: #2563eb; text-decoration: none;">info@leiatoetus.ee</a><br>
                                            <a href="https://www.leiatoetus.ee" style="color: #2563eb; text-decoration: none;">www.leiatoetus.ee</a>
                                        </p>
                                        <div style="margin: 15px 0;">
                                            <a href="https://facebook.com/leiatoetus" style="display: inline-block; margin-right: 10px;">
                                                <svg style="width: 24px; height: 24px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                                    <path fill="#2563eb" d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z"/>
                                                </svg>
                                            </a>
                                            <a href="https://instagram.com/leiatoetus" style="display: inline-block;">
                                                <svg style="width: 24px; height: 24px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                                                    <path fill="#2563eb" d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
                                                </svg>
                                            </a>
                                        </div>
                                        <p style="margin: 15px 0 0 0; font-size: 12px; color: #9ca3af;">
                                            Avar Agentuur OÜ<br>
                                            Pärnu mnt. 137, 11314 Tallinn
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </div>
        </center>
    </body>
    </html>
    """

    subject = f"Teavitused aktiveeritud - {company_name}"
    return send_email(user_email, subject, html_content)

def send_notifications_deactivated_email(user_email, company_name, subscription_data):
    """
    Saadab e-kirja kinnitamaks, et kasutaja on teavitused deaktiveerinud
    
    :param user_email: Kasutaja e-posti aadress
    :param company_name: Ettevõtte nimi
    :param subscription_data: Sõnastik tellimuse andmetega (lõppkuupäev jne)
    """
    
    # Vormindame kuupäeva
    end_date = datetime.strptime(subscription_data['end_date'], "%Y-%m-%d").strftime("%d.%m.%Y")
    
    html_content = f"""
    <!DOCTYPE html>
    <html lang="et">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Teavitused deaktiveeritud</title>
    </head>
    <body style="margin: 0; padding: 0; min-width: 100%; background-color: #ffffff;">
        <center style="width: 100%; table-layout: fixed; background-color: #ffffff; padding: 40px 0;">
            <div style="max-width: 600px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 4px; margin: 0 auto;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; font-family: 'Inter', Arial, sans-serif;">
                    <!-- Header Section -->
                    <tr>
                        <td style="padding: 40px 30px; background-color: #f8fafc; border-bottom: 1px solid #e5e7eb;">
                            <h1 style="margin: 0 0 20px 0; font-size: 24px; line-height: 32px; font-weight: 600; color: #111827;">
                                Teavitused on deaktiveeritud
                            </h1>
                            <p style="margin: 0; color: #4b5563; font-size: 16px; line-height: 24px;">
                                Olete deaktiveerinud teavitused ettevõttele <strong style="color: #111827;">{company_name}</strong>
                            </p>
                        </td>
                    </tr>

                    <!-- Info Section -->
                    <tr>
                        <td style="padding: 30px;">
                            <div style="background-color: #f8fafc; border: 1px solid #e5e7eb; border-radius: 4px; padding: 20px; margin-bottom: 20px;">
                                <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #111827;">Tellimuse info</h2>
                                <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 15px; line-height: 24px;">
                                    Teie tellimus kehtib kuni <strong style="color: #111827;">{end_date}</strong>
                                </p>
                                <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 24px;">
                                    Saate teavitused igal ajal uuesti aktiveerida enne tellimuse lõppemist.
                                </p>
                            </div>

                            <p style="color: #4b5563; font-size: 15px; line-height: 24px; margin-bottom: 24px; text-align: center;">
                                Soovite teavitused uuesti aktiveerida?
                            </p>

                            <div style="text-align: center;">
                                <a href="https://www.leiatoetus.ee/account/notifications" 
                                   style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px;">
                                    Aktiveeri teavitused
                                </a>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer Section -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="padding: 20px 0 0 0; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; line-height: 21px;">
                                        <p style="margin: 0 0 15px 0;">
                                            Parimate soovidega,<br>
                                            <strong style="color: #111827;">LeiaToetus.ee meeskond</strong>
                                        </p>
                                        <p style="margin: 0 0 10px 0;">
                                            <a href="mailto:info@leiatoetus.ee" style="color: #2563eb; text-decoration: none;">info@leiatoetus.ee</a><br>
                                            <a href="https://www.leiatoetus.ee" style="color: #2563eb; text-decoration: none;">www.leiatoetus.ee</a>
                                        </p>
                                        <div style="margin: 15px 0;">
                                            <a href="https://facebook.com/leiatoetus" style="display: inline-block; margin-right: 10px;">
                                                <svg style="width: 24px; height: 24px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                                    <path fill="#2563eb" d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z"/>
                                                </svg>
                                            </a>
                                            <a href="https://instagram.com/leiatoetus" style="display: inline-block;">
                                                <svg style="width: 24px; height: 24px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                                                    <path fill="#2563eb" d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
                                                </svg>
                                            </a>
                                        </div>
                                        <p style="margin: 15px 0 0 0; font-size: 12px; color: #9ca3af;">
                                            Avar Agentuur OÜ<br>
                                            Pärnu mnt. 137, 11314 Tallinn
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </div>
        </center>
    </body>
    </html>
    """

    subject = f"Teavitused deaktiveeritud - {company_name}"
    return send_email(user_email, subject, html_content)

# Test funktsiooni jaoks
if __name__ == "__main__":
    test_email = "georg@netikodu.ee"
    test_company = "MaxClean OÜ"
    test_subscription = {
        "end_date": "2025-03-14"
    }
    
    # Saada test kiri
    send_notifications_deactivated_email(test_email, test_company, test_subscription) 