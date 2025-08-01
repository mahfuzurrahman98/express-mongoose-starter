import * as ejs from 'ejs';
import * as path from 'path';
import * as fs from 'fs/promises';
import { createTransport, Transporter } from 'nodemailer';
import { CustomError } from '@/utils/custom-error'; // import { CustomError }
import { autoInjectable } from 'tsyringe';

@autoInjectable()
export class EmailService {
    private transporter: Transporter;

    /**
     * Constructor for EmailService.
     */
    constructor() {
        this.transporter = createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false, // Use `true` for port 465, `false` for all other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    /**
     * Render an EJS template with the provided data
     * @param templateName Name of the template file (without extension)
     * @param data Data to be passed to the template
     * @returns Rendered HTML string
     */
    async renderTemplate(templateName: string, data: any): Promise<string> {
        try {
            const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.ejs`);

            // Read the template file
            const templateContent = await fs.readFile(templatePath, 'utf-8');

            // Render the template with the provided data
            return ejs.render(templateContent, data);
        } catch (error: any) {
            throw error instanceof CustomError
                ? error
                : new CustomError(
                      500,
                      `[EmailService_renderTemplate]: Failed to render email template: ${error.message}`,
                  );
        }
    }

    /**
     * Send an email
     * @param recipients Array of recipient email addresses
     * @param subject Email subject
     * @param html HTML content of the email
     */
    async sendMail(recipients: string[], subject: string, html: string) {
        try {
            await this.transporter.sendMail({
                from: `"ProjectName" <${process.env.SMTP_USER}>`, // sender address
                to: recipients, // list of receivers
                subject, // Subject line
                html, // html body
            });
        } catch (error: any) {
            throw error instanceof CustomError
                ? error
                : new CustomError(
                      500,
                      `[EmailService_sendMail]: ${
                          error.message || 'Something went wrong sending email'
                      }`,
                  );
        }
    }
}
