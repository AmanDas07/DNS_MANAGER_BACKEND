import express from "express";
import { requireSignin } from "../middlewares/page.js"
import { deleteDnsRecord, getDnsRecordsForDomain, updateAAAARecord, updateARecord, updateCNAMERecord, updateMXRecord, updateNSRecord, updateSOARecord, updateSRVRecord, updateTXTRecord } from "../DNS_Controller/dnsController.js";

const router = express.Router();


router.post("/verifyDomain", requireSignin, getDnsRecordsForDomain);

router.post("/updateARecord", updateARecord);

router.post("/updateAAAARecord", updateAAAARecord);

router.post("/updateCNAMERecord", updateCNAMERecord);

router.post("/updateMXRecord", updateMXRecord);

router.post("/updateNSRecord", updateNSRecord);

router.post("/updateSOARecord", updateSOARecord);

router.post("/updateSRVRecord", updateSRVRecord);

router.post("/updateTXTRecord", updateTXTRecord);

router.post("/deleteRecord", deleteDnsRecord);

export default router