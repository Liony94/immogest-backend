import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../../entities/payment.entity';
import { Receipt } from '../../entities/receipt.entity';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class ReceiptService {
  private readonly logger = new Logger(ReceiptService.name);

  constructor(
    @InjectRepository(Receipt)
    private receiptRepository: Repository<Receipt>,
  ) {}

  async generateReceipt(payment: Payment): Promise<Buffer> {
    this.logger.debug(`Génération de quittance pour le paiement #${payment.id}`);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          info: {
            Title: 'Quittance de Loyer',
            Author: 'ImmoGest',
            Subject: 'Quittance de Loyer',
          }
        });

        const buffers: Buffer[] = [];
        doc.on('data', chunk => buffers.push(chunk));
        doc.on('end', async () => {
          const pdfBuffer = Buffer.concat(buffers);
          
          // Créer le nom du fichier
          const dueDate = new Date(payment.dueDate);
          const month = dueDate.toLocaleString('fr-FR', { month: 'long' });
          const year = dueDate.getFullYear();
          const fileName = `quittance_${month}_${year}.pdf`;

          // Sauvegarder la quittance en base de données
          const receipt = this.receiptRepository.create({
            pdfContent: pdfBuffer,
            fileName,
            month,
            year,
            payment,
            property: payment.paymentSchedule.property,
            owner: payment.paymentSchedule.property.owner,
            tenant: payment.paymentSchedule.tenant,
            amount: payment.amount,
            paymentDate: payment.paidAt
          });

          await this.receiptRepository.save(receipt);
          resolve(pdfBuffer);
        });
        doc.on('error', reject);

        // Style par défaut
        doc.font('Helvetica');
        
        // En-tête
        doc.fontSize(20)
           .text('QUITTANCE DE LOYER', { align: 'center' })
           .moveDown(2);

        // Cadre Bailleur
        doc.fontSize(12)
           .text('BAILLEUR', { underline: true })
           .moveDown(0.5);
        doc.fontSize(10)
           .text([
             `${payment.paymentSchedule.property.owner.firstName} ${payment.paymentSchedule.property.owner.lastName}`,
             payment.paymentSchedule.property.owner.address || '',
             payment.paymentSchedule.property.owner.email,
             payment.paymentSchedule.property.owner.phone || ''
           ].filter(Boolean).join('\n'))
           .moveDown(1.5);

        // Cadre Locataire
        doc.fontSize(12)
           .text('LOCATAIRE', { underline: true })
           .moveDown(0.5);
        doc.fontSize(10)
           .text([
             `${payment.paymentSchedule.tenant.firstName} ${payment.paymentSchedule.tenant.lastName}`,
             payment.paymentSchedule.tenant.address || '',
             payment.paymentSchedule.tenant.email,
             payment.paymentSchedule.tenant.phone || ''
           ].filter(Boolean).join('\n'))
           .moveDown(1.5);

        // Cadre Logement
        doc.fontSize(12)
           .text('LOGEMENT', { underline: true })
           .moveDown(0.5);
        doc.fontSize(10)
           .text([
             payment.paymentSchedule.property.title,
             payment.paymentSchedule.property.address
           ].join('\n'))
           .moveDown(1.5);

        // Cadre Paiement
        const month = new Date(payment.dueDate).toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
        doc.fontSize(12)
           .text('DÉTAILS DU PAIEMENT', { underline: true })
           .moveDown(0.5);
        doc.fontSize(10)
           .text([
             `Période : ${month}`,
             `Montant du loyer : ${payment.amount.toFixed(2)} €`,
             `Date de paiement : ${payment.paidAt ? new Date(payment.paidAt).toLocaleDateString('fr-FR') : 'Non payé'}`,
             `Méthode de paiement : ${payment.paymentMethod || 'Non spécifié'}`
           ].join('\n'))
           .moveDown(2);

        // Mention légale
        doc.fontSize(10)
           .text('Pour quittance, sous réserve de l\'encaissement du règlement.', {
             align: 'center',
             width: doc.page.width - 100
           })
           .moveDown(2);

        // Date et signature
        const date = new Date().toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        doc.fontSize(10)
           .text(`Fait à _____________, le ${date}`, { align: 'right' })
           .moveDown(2)
           .text('Signature du bailleur :', { align: 'right' })
           .moveDown(3);

        // Pied de page
        doc.fontSize(8)
           .fillColor('grey')
           .text('Document généré automatiquement par ImmoGest', {
             align: 'center'
           });

        // Finaliser le document
        doc.end();

      } catch (error) {
        this.logger.error('Erreur lors de la génération du PDF:', error);
        reject(error);
      }
    });
  }

  async getReceipt(id: number): Promise<Receipt> {
    return this.receiptRepository.findOne({
      where: { id },
      relations: ['payment', 'property', 'owner', 'tenant']
    });
  }

  async getReceiptsByPayment(paymentId: number): Promise<Receipt[]> {
    return this.receiptRepository.find({
      where: { payment: { id: paymentId } },
      relations: ['payment', 'property', 'owner', 'tenant'],
      order: { generatedAt: 'DESC' }
    });
  }

  async getReceiptsByProperty(propertyId: number): Promise<Receipt[]> {
    return this.receiptRepository.find({
      where: { property: { id: propertyId } },
      relations: ['payment', 'property', 'owner', 'tenant'],
      order: { generatedAt: 'DESC' }
    });
  }

  async getReceiptsByTenant(tenantId: number): Promise<Receipt[]> {
    return this.receiptRepository.find({
      where: { tenant: { id: tenantId } },
      relations: ['payment', 'property', 'owner', 'tenant'],
      order: { generatedAt: 'DESC' }
    });
  }

  async getReceiptsByOwner(ownerId: number): Promise<Receipt[]> {
    return this.receiptRepository.find({
      where: { owner: { id: ownerId } },
      relations: ['payment', 'property', 'owner', 'tenant'],
      order: { generatedAt: 'DESC' }
    });
  }

  async getAllReceipts(propertyId?: number, tenantId?: number, ownerId?: number): Promise<Receipt[]> {
    const queryBuilder = this.receiptRepository
      .createQueryBuilder('receipt')
      .leftJoinAndSelect('receipt.payment', 'payment')
      .leftJoinAndSelect('receipt.property', 'property')
      .leftJoinAndSelect('receipt.owner', 'owner')
      .leftJoinAndSelect('receipt.tenant', 'tenant')
      .orderBy('receipt.generatedAt', 'DESC');

    if (propertyId) {
      queryBuilder.andWhere('property.id = :propertyId', { propertyId });
    }

    if (tenantId) {
      queryBuilder.andWhere('tenant.id = :tenantId', { tenantId });
    }

    if (ownerId) {
      queryBuilder.andWhere('owner.id = :ownerId', { ownerId });
    }

    return queryBuilder.getMany();
  }
} 