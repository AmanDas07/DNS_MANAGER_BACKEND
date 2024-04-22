import { DnsManagementClient } from '@azure/arm-dns';
import { ClientSecretCredential } from '@azure/identity';
import { DefaultAzureCredential } from '@azure/identity';
import axios from 'axios';
import express from "express";
import { requireSignin } from "../middlewares/page.js"

const dnsController = express.Router();
const tenantId = process.env.AZURE_TENANT_ID;
const clientId = process.env.AZURE_CLIENT_ID;
const clientSecret = process.env.AZURE_PASSWORD;
const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
const resourceGroup = process.env.AZURE_RESOURCE_GROUP;
const dnsZoneName = process.env.DNS_ZONE;

dnsController.post("/verifyDomain", requireSignin, async (req, res) => {
    try {
        const { domainName } = req.body;


        const credentials = new ClientSecretCredential(tenantId, clientId, clientSecret);
        const dnsClient = new DnsManagementClient(credentials, subscriptionId);
        const recordSetIterator = dnsClient.recordSets.listByDnsZone(resourceGroup, dnsZoneName);


        const records = [];
        for await (const recordSet of recordSetIterator) {
            const { name, type, aRecords, aaaaRecords, mxRecords, txtRecords, cnameRecord, nsRecords, soaRecord } = recordSet;
            let recordData;

            switch (type.replace('Microsoft.Network/dnszones/', '')) {
                case 'A':
                    recordData = aRecords;
                    break;
                case 'AAAA':
                    recordData = aaaaRecords;
                    break;
                case 'MX':
                    recordData = mxRecords;
                    break;
                case 'TXT':
                    recordData = txtRecords;
                    break;
                case 'CNAME':
                    recordData = cnameRecord;
                    break;
                case 'NS':
                    recordData = nsRecords;
                    break;
                case 'SOA':
                    recordData = soaRecord;
                    break;
                default:
                    recordData = undefined;
            }

            records.push({
                name,
                type: type.replace('Microsoft.Network/dnszones/', ''),
                data: recordData,
            });
        }

        console.log(JSON.stringify(records));
        return res.status(200).json(records);
    } catch (error) {
        console.error('Error retrieving DNS records:', error);
        return res.status(500).json({ error: 'Failed to retrieve DNS records', details: error.message });
    }
});


dnsController.post("/updateARecord", async (req, res) => {
    try {
        const { domainName, recordSetName } = req.body;
        if (!domainName) {
            return res.status(400).send('Please Enter domain Name');
        }
        if (!recordSetName) {
            return res.status(400).send('Please Enter Record set Name');
        }
        const response = await axios.get('https://api.ipify.org?format=json');
        const ipAddress = response.data.ip;
        console.log(ipAddress);

        const credentials = new ClientSecretCredential(tenantId, clientId, clientSecret);
        const dnsClient = new DnsManagementClient(credentials, subscriptionId);

        const ttl = 3600;
        const recordData = {
            ttl,
            aRecords: [{ ipv4Address: ipAddress }]
        };

        const result = await dnsClient.recordSets.createOrUpdate(resourceGroup, domainName, recordSetName, 'A', recordData);
        console.log('A Record updated:', result);

        return res.status(200).json({ message: 'A Record updated successfully', data: result });
    } catch (error) {
        console.error('Failed to update A Record:', error);
        return res.status(500).json({ error: 'Failed to update A Record', details: error.message });
    }
});



dnsController.post("/updateAAAARecord", async (req, res) => {
    try {
        const { domainName, recordSetName, ipv6Address } = req.body;
        const credentials = new ClientSecretCredential(tenantId, clientId, clientSecret);
        const dnsClient = new DnsManagementClient(credentials, subscriptionId);

        const ttl = 3600;

        const recordData = {
            ttl,
            aaaaRecords: [{ ipv6Address }]
        };
        const result = await dnsClient.recordSets.createOrUpdate(resourceGroup, domainName, recordSetName, 'AAAA', recordData);

        console.log('AAAA Record updated:', result);
        return res.status(200).json({ message: 'AAAA Record updated successfully', data: result });
    } catch (error) {
        console.error('Failed to update AAAA Record:', error);
        return res.status(500).json({ error: 'Failed to update AAAA Record', details: error.message });
    }
});


dnsController.post("/updateCNAMERecord", async (req, res) => {
    try {
        const { domainName, recordSetName, canonicalName } = req.body;


        if (!domainName) {
            return response.status(400).send('Please Enter domain Name');
        }
        if (!recordSetName) {
            return response.status(400).send('Please Enter Record set Name');
        }
        if (!canonicalName) {
            return response.status(400).send('Please Enter Canonical Name');
        }



        const credentials = new ClientSecretCredential(tenantId, clientId, clientSecret);
        const dnsClient = new DnsManagementClient(credentials, subscriptionId);

        const ttl = 3600;

        const recordData = {
            ttl,
            cnameRecord: { cname: canonicalName }
        };

        const result = await dnsClient.recordSets.createOrUpdate(resourceGroup, domainName, recordSetName, 'CNAME', recordData);

        console.log('CNAME Record updated:', result);
        return res.status(200).json({ message: 'CNAME Record updated successfully', data: result });
    } catch (error) {
        console.error('Failed to update CNAME Record:', error);
        return res.status(500).json({ error: 'Failed to update CNAME Record', details: error.message });
    }
});

dnsController.post("/updateMXRecord", async (req, res) =>{
    try {
        const { domainName, recordSetName, mailExchange, preference } = req.body;

        const numericPreference = Number(preference);
        if (isNaN(numericPreference)) {
            return res.status(400).json({ error: 'Invalid preference value. Please provide a number.' });
        }

        const credentials = new ClientSecretCredential(tenantId, clientId, clientSecret);
        const dnsClient = new DnsManagementClient(credentials, subscriptionId);

        const ttl = 3600;

        const recordData = {
            ttl,
            mxRecords: [
                {
                    preference: numericPreference,
                    exchange: mailExchange
                }
            ]
        };


        const result = await dnsClient.recordSets.createOrUpdate(resourceGroup, domainName, recordSetName, 'MX', recordData);

        console.log('MX Record updated:', result);
        return res.status(200).json({ message: 'MX Record updated successfully', result });
    } catch (error) {
        console.error('Failed to update MX Record:', error);
        return res.status(500).json({ error: 'Failed to update MX Record', details: error.message });
    }
});


dnsController.post("/updateNSRecord", async (req, res) => {
    try {
        const { domainName, recordSetName, nameServers } = req.body;
        const credentials = new ClientSecretCredential(tenantId, clientId, clientSecret);
        const dnsClient = new DnsManagementClient(credentials, subscriptionId);

        const ttl = 3600;
        const recordData = {
            ttl,
            nsRecords: nameServers.map(ns => ({ nsdname: ns }))
        };

        const result = await dnsClient.recordSets.createOrUpdate(resourceGroup, domainName, recordSetName, 'NS', recordData);

        console.log('NS Record updated:', result);
        return res.status(200).json({ message: 'NS Record updated successfully', data: result });
    } catch (error) {
        console.error('Failed to update NS Record:', error);
        return res.status(500).json({ error: 'Failed to update NS Record', details: error.message });
    }
});


dnsController.post("/updateSOARecord", async (req, res) =>{
    try {
        const { domainName, email, refreshTime, retryTime, expireTime, minimumTTL } = req.body;
        const credentials = new ClientSecretCredential(tenantId, clientId, clientSecret);
        const dnsClient = new DnsManagementClient(credentials, subscriptionId);

        const soaRecord = {
            host: domainName,
            email: email,
            serialNumber: BigInt(new Date().getTime()).toString(10),
            refreshTime: Number(refreshTime),
            retryTime: Number(retryTime),
            expireTime: Number(expireTime),
            minimumTtl: Number(minimumTTL)
        };

        const recordData = {
            ttl: 3600,
            soaRecord: soaRecord
        };

        const result = await dnsClient.recordSets.createOrUpdate(resourceGroup, domainName, "@", 'SOA', recordData);

        console.log('SOA Record updated:', result);
        return res.status(200).json({ message: 'SOA Record updated successfully', data: result });
    } catch (error) {
        console.error('Failed to update SOA Record:', error);
        return res.status(500).json({ error: 'Failed to update SOA Record', details: error.message });
    }
});


dnsController.post("/updateSRVRecord", async (req, res) => {
    try {
        const { domainName, recordSetName, service, protocol, priority, weight, port, target } = req.body;
        const numericpriority = Number(priority);
        if (isNaN(numericpriority)) {
            return res.status(400).json({ error: 'Invalid preference value. Please provide a number.' });
        }
        const numericweight = Number(weight);
        if (isNaN(weight)) {
            return res.status(400).json({ error: 'Invalid preference value. Please provide a number.' });
        }
        const numericport = Number(port);
        if (isNaN(port)) {
            return res.status(400).json({ error: 'Invalid preference value. Please provide a number.' });
        }
        const credentials = new ClientSecretCredential(tenantId, clientId, clientSecret);
        const dnsClient = new DnsManagementClient(credentials, subscriptionId);

        const srvRecord = {
            priority: numericpriority,
            weight: numericweight,
            port: numericport,
            target: target
        };

        const recordData = {
            ttl: 3600,
            srvRecords: [srvRecord]
        };

        const result = await dnsClient.recordSets.createOrUpdate(resourceGroup, domainName, recordSetName, 'SRV', recordData);

        console.log('SRV Record updated:', result);
        return res.status(200).json({ message: 'SRV Record updated successfully', data: result });
    } catch (error) {
        console.error('Failed to update SRV Record:', error);
        return res.status(500).json({ error: 'Failed to update SRV Record', details: error.message });
    }
});


dnsController.post("/updateTXTRecord", async (req, res) =>{
    try {
        const { domainName, recordSetName, textEntries } = req.body;
        const credentials = new ClientSecretCredential(tenantId, clientId, clientSecret);
        const dnsClient = new DnsManagementClient(credentials, subscriptionId);


        const txtRecords = textEntries.map(text => ({ value: [text] }));
        const recordData = {
            ttl: 3600,
            txtRecords: txtRecords
        };


        const result = await dnsClient.recordSets.createOrUpdate(resourceGroup, domainName, recordSetName, 'TXT', recordData);


        console.log('TXT Record updated:', result);
        return res.status(200).json({ message: 'TXT Record updated successfully', data: result });
    } catch (error) {
        console.error('Failed to update TXT Record:', error);
        return res.status(500).json({ error: 'Failed to update TXT Record', details: error.message });
    }
});


dnsController.post("/deleteRecord", async (req, res) => {
    const { recordType, recordSetName, dnsZoneName, resourceGroup } = req.body;

    const credentials = new DefaultAzureCredential();
    const dnsClient = new DnsManagementClient(credentials, process.env.AZURE_SUBSCRIPTION_ID);

    try {
        await dnsClient.recordSets.delete(resourceGroup, dnsZoneName, recordSetName, recordType);
        res.status(200).send({ message: 'Record deleted successfully' });
    } catch (error) {
        console.error('Error deleting DNS record:', error);
        res.status(500).send({ error: 'Error deleting DNS record', details: error.message });
    }
});

export default dnsController;
