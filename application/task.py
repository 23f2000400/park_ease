import csv
from celery import shared_task
from .models import *
import datetime
import time

@shared_task(ignore_results = False, name = 'download_csv_report')
def csv_report():
    reservations = Reservation.query.all()
    csv_file_name = f"reservations_report_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    with open(f'static/{csv_file_name}', 'w' , newline='') as csvfile:
        sr_no = 1
        fieldnames = ['id', 'user_id', 'spot_id','vehical No','cost', 'check_in', 'check_out', 'status']
        res_csv = csv.writer(csvfile, delimiter=',')
        res_csv.writerow(fieldnames)
        for reservation in reservations:
            this_res = [
                    sr_no,
                 reservation.id,
                 reservation.user_id,
                reservation.spot_id,
                 reservation.vehicle_number,
                 reservation.cost,
                 reservation.check_in,
                 reservation.check_out,
                 reservation.status
            ]
            res_csv.writerow(this_res)
            sr_no += 1
    return csv_file_name

@shared_task(ignore_results = False, name = 'monthly_report')
def monthly_report():
    return "Monthly report generated"

@shared_task(ignore_results = False, name = 'daily_report')
def daily_report():
    return "Daily report generated"

