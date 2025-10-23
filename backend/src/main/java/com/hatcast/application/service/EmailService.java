package com.hatcast.application.service;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import com.sendgrid.helpers.mail.objects.Personalization;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Map;

@Service
public class EmailService {
    
    private final SendGrid sendGrid;
    private final String fromEmail;
    private final String fromName;
    
    public EmailService(
            @Value("${sendgrid.api-key}") String apiKey,
            @Value("${sendgrid.from-email}") String fromEmail,
            @Value("${sendgrid.from-name}") String fromName) {
        this.sendGrid = new SendGrid(apiKey);
        this.fromEmail = fromEmail;
        this.fromName = fromName;
    }
    
    public void sendCastingReminder(String toEmail, String toName, Map<String, Object> templateData) {
        try {
            Mail mail = new Mail();
            mail.setFrom(new Email(fromEmail, fromName));
            mail.setTemplateId("d-casting-reminder-template-id");
            
            Personalization personalization = new Personalization();
            personalization.addTo(new Email(toEmail, toName));
            
            // Ajouter les données du template
            for (Map.Entry<String, Object> entry : templateData.entrySet()) {
                personalization.addDynamicTemplateData(entry.getKey(), entry.getValue());
            }
            
            mail.addPersonalization(personalization);
            
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            
            Response response = sendGrid.api(request);
            
            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                System.out.println("Casting reminder email sent successfully to: " + toEmail);
            } else {
                System.err.println("Failed to send casting reminder email. Status: " + response.getStatusCode());
            }
            
        } catch (IOException e) {
            System.err.println("Error sending casting reminder email: " + e.getMessage());
            throw new RuntimeException("Failed to send casting reminder email", e);
        }
    }
    
    public void sendNewShowNotification(String toEmail, String toName, Map<String, Object> templateData) {
        try {
            Mail mail = new Mail();
            mail.setFrom(new Email(fromEmail, fromName));
            mail.setTemplateId("d-new-show-template-id");
            
            Personalization personalization = new Personalization();
            personalization.addTo(new Email(toEmail, toName));
            
            // Ajouter les données du template
            for (Map.Entry<String, Object> entry : templateData.entrySet()) {
                personalization.addDynamicTemplateData(entry.getKey(), entry.getValue());
            }
            
            mail.addPersonalization(personalization);
            
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            
            Response response = sendGrid.api(request);
            
            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                System.out.println("New show notification email sent successfully to: " + toEmail);
            } else {
                System.err.println("Failed to send new show notification email. Status: " + response.getStatusCode());
            }
            
        } catch (IOException e) {
            System.err.println("Error sending new show notification email: " + e.getMessage());
            throw new RuntimeException("Failed to send new show notification email", e);
        }
    }
    
    public void sendPasswordReset(String toEmail, String toName, String resetLink) {
        try {
            Mail mail = new Mail();
            mail.setFrom(new Email(fromEmail, fromName));
            mail.setTemplateId("d-password-reset-template-id");
            
            Personalization personalization = new Personalization();
            personalization.addTo(new Email(toEmail, toName));
            personalization.addDynamicTemplateData("reset_link", resetLink);
            personalization.addDynamicTemplateData("user_name", toName);
            
            mail.addPersonalization(personalization);
            
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            
            Response response = sendGrid.api(request);
            
            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                System.out.println("Password reset email sent successfully to: " + toEmail);
            } else {
                System.err.println("Failed to send password reset email. Status: " + response.getStatusCode());
            }
            
        } catch (IOException e) {
            System.err.println("Error sending password reset email: " + e.getMessage());
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }
    
    public void sendWelcomeEmail(String toEmail, String toName) {
        try {
            Mail mail = new Mail();
            mail.setFrom(new Email(fromEmail, fromName));
            mail.setTemplateId("d-welcome-template-id");
            
            Personalization personalization = new Personalization();
            personalization.addTo(new Email(toEmail, toName));
            personalization.addDynamicTemplateData("user_name", toName);
            
            mail.addPersonalization(personalization);
            
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            
            Response response = sendGrid.api(request);
            
            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                System.out.println("Welcome email sent successfully to: " + toEmail);
            } else {
                System.err.println("Failed to send welcome email. Status: " + response.getStatusCode());
            }
            
        } catch (IOException e) {
            System.err.println("Error sending welcome email: " + e.getMessage());
            throw new RuntimeException("Failed to send welcome email", e);
        }
    }
    
    public void sendCastingResult(String toEmail, String toName, Map<String, Object> templateData) {
        try {
            Mail mail = new Mail();
            mail.setFrom(new Email(fromEmail, fromName));
            mail.setTemplateId("d-casting-result-template-id");
            
            Personalization personalization = new Personalization();
            personalization.addTo(new Email(toEmail, toName));
            
            // Ajouter les données du template
            for (Map.Entry<String, Object> entry : templateData.entrySet()) {
                personalization.addDynamicTemplateData(entry.getKey(), entry.getValue());
            }
            
            mail.addPersonalization(personalization);
            
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            
            Response response = sendGrid.api(request);
            
            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                System.out.println("Casting result email sent successfully to: " + toEmail);
            } else {
                System.err.println("Failed to send casting result email. Status: " + response.getStatusCode());
            }
            
        } catch (IOException e) {
            System.err.println("Error sending casting result email: " + e.getMessage());
            throw new RuntimeException("Failed to send casting result email", e);
        }
    }
}